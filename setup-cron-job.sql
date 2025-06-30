-- ===== SETUP CRON JOB FOR DAILY VAULT DELIVERY CHECK =====
-- Run this in Supabase SQL Editor after deploying Edge Functions

-- 1. First, make sure pg_cron and pg_net extensions are enabled
-- Go to Dashboard → Database → Extensions and enable:
-- - pg_cron ✓
-- - pg_net ✓

-- 2. Create daily cron job at 9 AM
-- IMPORTANT: Replace 'YOUR-PROJECT-ID' with your actual Supabase project ID
SELECT cron.schedule(
  'daily-vault-delivery-check',
  '0 9 * * *', -- 9 AM every day (UTC time)
  $$
  SELECT net.http_post(
    'https://YOUR-PROJECT-ID.supabase.co/functions/v1/check-inactive-vaults',
    '{}',
    'application/json'
  );
  $$
);

-- 3. Verify the cron job was created successfully
SELECT * FROM cron.job WHERE jobname = 'daily-vault-delivery-check';

-- 4. OPTIONAL: Create a test job that runs every minute for testing
-- Uncomment the lines below ONLY for testing, then delete the job
/*
SELECT cron.schedule(
  'test-vault-check',
  '* * * * *', -- Every minute - ONLY FOR TESTING!
  $$
  SELECT net.http_post(
    'https://YOUR-PROJECT-ID.supabase.co/functions/v1/check-inactive-vaults',
    '{}',
    'application/json'
  );
  $$
);

-- To remove the test job after testing:
-- SELECT cron.unschedule('test-vault-check');
*/

-- 5. View recent cron job execution history
SELECT 
  job.jobname,
  job.schedule,
  job.active,
  details.jobid,
  details.start_time,
  details.end_time,
  details.return_message
FROM cron.job job
LEFT JOIN cron.job_run_details details ON job.jobid = details.jobid
WHERE job.jobname = 'daily-vault-delivery-check'
ORDER BY details.start_time DESC
LIMIT 10;

-- 6. If you need to update the schedule or URL later:
-- First unschedule the old job:
-- SELECT cron.unschedule('daily-vault-delivery-check');
-- Then create a new one with updated settings

-- 7. Time zone notes:
-- Cron jobs run in UTC time
-- 9 AM UTC = 4 AM EST / 1 AM PST
-- Adjust the hour as needed for your timezone
-- Example for 9 AM EST: '0 14 * * *' (14:00 UTC = 9:00 AM EST)

-- 8. Alternative schedules you might want:
-- Every hour: '0 * * * *'
-- Twice daily (9 AM and 9 PM UTC): '0 9,21 * * *'
-- Only on weekdays at 9 AM: '0 9 * * 1-5'
-- Weekly on Mondays at 9 AM: '0 9 * * 1'