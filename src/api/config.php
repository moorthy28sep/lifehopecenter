<?php
// Hostinger MySQL credentials

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u866750606_lifehope_db');
define('DB_USER', getenv('DB_USER') ?: 'u866750606_lifehope_user');
define('DB_PASS', getenv('DB_PASS') ?: 'Lifehope2026');

define('CASHFREE_APP_ID', getenv('CASHFREE_APP_ID')); 
define('CASHFREE_SECRET_KEY', getenv('CASHFREE_SECRET_KEY')); 
define('CASHFREE_API_BASE', getenv('CASHFREE_API_BASE') ?: 'https://api.cashfree.com');