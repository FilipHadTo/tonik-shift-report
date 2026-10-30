-- The report's clock counts minutes from the Night's start, 08:00 (ticket 28), not from 18:00, so a
-- daytime clean report no longer wraps at 18:00. Same time of day, new count: +600 minutes, within a day.
-- Only the number changes; every report keeps its clock time (e.g. 20:00 was 120, is now 720).
UPDATE "reports" SET "clock" = ("clock" + 600) % 1440;
