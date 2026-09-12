<?php

function lfh_notification_http_json($url, $payload, $headers = [], $timeout = 20) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge([
        'Content-Type: application/json',
        'Accept: application/json',
    ], $headers));
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

    $raw = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    $decoded = null;
    if ($raw !== false && $raw !== '') {
        $decoded = json_decode($raw, true);
    }

    return [
        'success' => ($httpCode >= 200 && $httpCode < 300) && $raw !== false,
        'http_code' => $httpCode,
        'error' => $curlError,
        'body' => $decoded ?? $raw,
    ];
}

function lfh_notification_normalize_phone($phone) {
    $digits = preg_replace('/\D+/', '', (string) $phone);
    if ($digits === '') {
        return '';
    }

    if (strlen($digits) >= 10 && strlen($digits) <= 15) {
        return '+' . ltrim($digits, '+');
    }

    return '+' . $digits;
}

function lfh_send_booking_notification($conn, $bookingId, $event = 'payment_paid') {
    if (!$conn || !$bookingId) {
        return [
            'success' => true,
            'status' => 'skipped',
            'message' => 'No booking id supplied.',
        ];
    }

    $bookingStmt = $conn->prepare('SELECT id, customer_name, email, phone, doctor_name, selected_service, appointment_date, appointment_time, reminder_channel, payment_status FROM consultation_bookings WHERE id = ? LIMIT 1');
    if (!$bookingStmt) {
        return [
            'success' => true,
            'status' => 'skipped',
            'message' => 'Booking lookup unavailable.',
        ];
    }

    $bookingStmt->bind_param('i', $bookingId);
    $bookingStmt->execute();
    $result = $bookingStmt->get_result();
    $booking = $result ? $result->fetch_assoc() : null;
    $bookingStmt->close();

    if (!$booking) {
        return [
            'success' => true,
            'status' => 'skipped',
            'message' => 'Booking not found.',
        ];
    }

    $channel = strtolower(trim((string) ($booking['reminder_channel'] ?? 'whatsapp')));
    $customerName = trim((string) ($booking['customer_name'] ?? 'Patient'));
    $doctorName = trim((string) ($booking['doctor_name'] ?? 'care team'));
    $serviceName = trim((string) ($booking['selected_service'] ?? 'consultation'));
    $appointmentDate = trim((string) ($booking['appointment_date'] ?? ''));
    $appointmentTime = trim((string) ($booking['appointment_time'] ?? ''));
    $phone = lfh_notification_normalize_phone((string) ($booking['phone'] ?? ''));
    $statusLabel = strtoupper((string) ($booking['payment_status'] ?? 'pending'));

    $message = "Hi {$customerName}, your consultation with {$doctorName} for {$serviceName} is confirmed. Appointment: {$appointmentDate} at {$appointmentTime}. Payment status: {$statusLabel}. Please keep your phone ready for follow-up.";

    $whatsappToken = defined('WHATSAPP_API_TOKEN') ? WHATSAPP_API_TOKEN : getenv('WHATSAPP_API_TOKEN');
    $whatsappPhoneNumberId = defined('WHATSAPP_PHONE_NUMBER_ID') ? WHATSAPP_PHONE_NUMBER_ID : getenv('WHATSAPP_PHONE_NUMBER_ID');
    $smsApiUrl = defined('SMS_API_URL') ? SMS_API_URL : getenv('SMS_API_URL');
    $smsApiKey = defined('SMS_API_KEY') ? SMS_API_KEY : getenv('SMS_API_KEY');
    $smsFromNumber = defined('SMS_FROM_NUMBER') ? SMS_FROM_NUMBER : getenv('SMS_FROM_NUMBER');

    $notificationResponse = [
        'success' => true,
        'status' => 'queued',
        'channel' => $channel,
        'booking_id' => $bookingId,
        'event' => $event,
        'message' => 'Notification queued successfully.',
    ];

    if ($channel === 'whatsapp' && $phone !== '' && !empty($whatsappToken) && !empty($whatsappPhoneNumberId)) {
        $waPayload = [
            'messaging_product' => 'whatsapp',
            'to' => $phone,
            'type' => 'text',
            'text' => [
                'body' => $message,
            ],
        ];

        $waHeaders = [
            'Authorization: Bearer ' . $whatsappToken,
        ];

        $waResult = lfh_notification_http_json(
            'https://graph.facebook.com/v18.0/' . rawurlencode($whatsappPhoneNumberId) . '/messages',
            $waPayload,
            $waHeaders,
            25
        );

        $notificationResponse['provider'] = 'whatsapp';
        $notificationResponse['provider_response'] = $waResult;
        $notificationResponse['success'] = $waResult['success'];
        $notificationResponse['status'] = $waResult['success'] ? 'sent' : 'failed';
        $notificationResponse['message'] = $waResult['success'] ? 'WhatsApp notification sent.' : 'WhatsApp notification failed.';

        if (!$waResult['success']) {
            error_log('LifeHope WhatsApp notification failed for booking ' . $bookingId . ': ' . print_r($waResult, true));
        }

        return $notificationResponse;
    }

    if ($channel === 'sms' && $phone !== '' && !empty($smsApiUrl)) {
        $smsPayload = [
            'to' => $phone,
            'message' => $message,
            'from' => $smsFromNumber,
            'api_key' => $smsApiKey,
        ];

        $smsResult = lfh_notification_http_json($smsApiUrl, $smsPayload, [], 25);

        $notificationResponse['provider'] = 'sms';
        $notificationResponse['provider_response'] = $smsResult;
        $notificationResponse['success'] = $smsResult['success'];
        $notificationResponse['status'] = $smsResult['success'] ? 'sent' : 'failed';
        $notificationResponse['message'] = $smsResult['success'] ? 'SMS notification sent.' : 'SMS notification failed.';

        if (!$smsResult['success']) {
            error_log('LifeHope SMS notification failed for booking ' . $bookingId . ': ' . print_r($smsResult, true));
        }

        return $notificationResponse;
    }

    if (defined('NOTIFICATION_EMAIL_TO') && constant('NOTIFICATION_EMAIL_TO')) {
        $subject = 'LifeHope consultation booking: ' . $customerName;
        $to = constant('NOTIFICATION_EMAIL_TO');
        $headers = [
            'From: no-reply@lifehopewellness.com',
            'Reply-To: ' . ($booking['email'] ?? 'hello@lifehopewellness.com'),
            'Content-Type: text/plain; charset=UTF-8',
        ];
        @mail($to, $subject, $message, implode("\r\n", $headers));
    }

    return $notificationResponse;
}
