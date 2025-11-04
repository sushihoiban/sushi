CREATE TYPE admin_booking_row AS (
    id UUID,
    booking_date DATE,
    booking_time TIME,
    party_size INT,
    group_id UUID,
    customer_name TEXT,
    customer_phone TEXT,
    tables TEXT
);

CREATE OR REPLACE FUNCTION get_admin_bookings()
RETURNS SETOF admin_booking_row AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.group_id as id,
        b.booking_date,
        b.booking_time,
        SUM(b.party_size)::INT as party_size,
        b.group_id,
        c.name as customer_name,
        c.phone as customer_phone,
        STRING_AGG(rt.table_number::TEXT, ', ' ORDER BY rt.table_number) as tables
    FROM
        public.bookings b
    LEFT JOIN
        public.customers c ON b.customer_id = c.id
    LEFT JOIN
        public.restaurant_tables rt ON b.table_id = rt.id
    GROUP BY
        b.group_id, b.booking_date, b.booking_time, c.name, c.phone
    ORDER BY
        b.booking_date DESC, b.booking_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
