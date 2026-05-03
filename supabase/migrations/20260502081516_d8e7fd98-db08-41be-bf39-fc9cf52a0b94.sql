ALTER TABLE public.booking_requests
  ADD CONSTRAINT customer_name_length CHECK (char_length(customer_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT customer_phone_length CHECK (char_length(customer_phone) BETWEEN 5 AND 30),
  ADD CONSTRAINT customer_email_length CHECK (customer_email IS NULL OR char_length(customer_email) <= 255),
  ADD CONSTRAINT persons_range CHECK (persons BETWEEN 1 AND 50),
  ADD CONSTRAINT desired_date_length CHECK (desired_date IS NULL OR char_length(desired_date) <= 100),
  ADD CONSTRAINT origin_length CHECK (origin IS NULL OR char_length(origin) <= 100),
  ADD CONSTRAINT language_valid CHECK (language IN ('es','en','zh','hi','ar','pt','bn','ru','ja','de')),
  ADD CONSTRAINT deposit_percent_range CHECK (deposit_percent BETWEEN 1 AND 100),
  ADD CONSTRAINT total_price_positive CHECK (total_price_cop > 0 AND total_price_cop < 100000000000),
  ADD CONSTRAINT deposit_amount_positive CHECK (deposit_amount_cop > 0),
  ADD CONSTRAINT notes_length CHECK (notes IS NULL OR char_length(notes) <= 2000);