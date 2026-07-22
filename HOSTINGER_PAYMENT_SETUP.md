# Hostinger MySQL + Stripe Payment Setup

This project uses PHP endpoints and a MySQL database for consultation bookings. On Hostinger, the setup should be done in the hPanel database and file manager.

## 1) Create the MySQL database in Hostinger

1. Log in to Hostinger hPanel.
2. Open MySQL Databases.
3. Create a new database (for example: `lifehope_db`).
4. Create a database user and assign it to the database.
5. Copy the database name, username, password, and host (usually `localhost`).

## 2) Create the tables in MySQL

Open phpMyAdmin from Hostinger and run these SQL statements.

```sql
CREATE TABLE IF NOT EXISTS contact_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  preferred_service VARCHAR(255) DEFAULT NULL,
  health_concern TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

```sql
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  selected_service VARCHAR(255) DEFAULT '',
  notes TEXT DEFAULT NULL,
  payment_id VARCHAR(255) DEFAULT NULL,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  booking_date_time DATETIME NOT NULL,
  checkout_session_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 3) Update the PHP database config

In the uploaded PHP file [src/api/db.php](src/api/db.php), replace the database credentials with your Hostinger values:

```php
$host = "localhost";
$dbname = "your_database_name";
$username = "your_db_user";
$password = "your_db_password";
```

## 4) Upload the PHP files to Hostinger

In File Manager, go to the public_html folder and create an `api` folder.

Upload these files into the `public_html/api` folder:

- [src/api/contact.php](src/api/contact.php)
- [src/api/db.php](src/api/db.php)
- [src/api/get-contacts.php](src/api/get-contacts.php)
- [src/api/update-contact.php](src/api/update-contact.php)
- [src/api/delete-contact.php](src/api/delete-contact.php)
- [src/api/create-checkout-session.php](src/api/create-checkout-session.php)
- [src/api/booking-confirmation.php](src/api/booking-confirmation.php)
- [src/api/get-bookings.php](src/api/get-bookings.php)
- [src/api/stripe-webhook.php](src/api/stripe-webhook.php)

Upload this file to the site root:

- [booking-confirmation.html](booking-confirmation.html)

## 5) Configure Stripe

1. Create or log in to a Stripe account.
2. Go to Developers > API keys.
3. Copy the Secret key (`sk_test_...` or `sk_live_...`).
4. Go to Developers > Webhooks.
5. Add a new endpoint:
   - URL: `https://yourdomain.com/api/stripe-webhook.php`
   - Select event: `checkout.session.completed`
6. Copy the webhook signing secret (`whsec_...`).

## 6) Add Stripe keys to the PHP app

Hostinger shared hosting does not automatically load `.env` variables for PHP. Use one of these methods:

### Option A: Add them directly in the PHP file
In [src/api/create-checkout-session.php](src/api/create-checkout-session.php) and [src/api/stripe-webhook.php](src/api/stripe-webhook.php), replace the `getenv(...)` lines with your actual values.

```php
$stripeSecretKey = 'sk_test_your_key_here';
$endpointSecret = 'whsec_your_signing_secret_here';
```

### Option B: Create a config file
Create `public_html/api/config.php` and define constants there.

```php
<?php
define('STRIPE_SECRET_KEY', 'sk_test_your_key_here');
define('STRIPE_WEBHOOK_SECRET', 'whsec_your_signing_secret_here');
```

Then include it from the PHP files and use those constants.

## 7) Set the Stripe success/cancel URLs

The PHP booking script already redirects to:

- Success: `https://yourdomain.com/booking-confirmation.html?booking_id=...`
- Cancel: `https://yourdomain.com/`

Make sure your domain is correct.

## 8) Test the payment flow

1. Open the website and fill the service booking form.
2. Click Pay ₹1,000 and continue.
3. Complete the Stripe test payment.
4. Check that:
   - the booking row is inserted into `consultation_bookings`
   - the payment status becomes `paid`
   - the confirmation page loads with the booking details

## 9) Verify the webhook

In Stripe Dashboard, check the webhook events page. A successful `checkout.session.completed` event should be visible.

If not, verify:
- the webhook URL is correct
- the signing secret is correct
- PHP can receive POST requests to `stripe-webhook.php`
