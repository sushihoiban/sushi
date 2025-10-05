-- This function allows for efficient server-side filtering of customers.
CREATE OR REPLACE FUNCTION filter_customers(
    name_filter TEXT,
    booking_status_filter TEXT
)
RETURNS SETOF customers AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.customers c
    WHERE
        -- Filter by name if a filter is provided
        (name_filter IS NULL OR c.name ILIKE '%' || name_filter || '%')
    AND
        -- Filter by booking status
        (
            booking_status_filter = 'all' OR
            (booking_status_filter = 'active' AND EXISTS (
                SELECT 1 FROM public.bookings b WHERE b.customer_id = c.id AND b.booking_date >= current_date
            )) OR
            (booking_status_filter = 'none' AND NOT EXISTS (
                SELECT 1 FROM public.bookings b WHERE b.customer_id = c.id AND b.booking_date >= current_date
            ))
        )
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;
