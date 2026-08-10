import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL =
    "https://gswolrsbhvsjdedhgyly.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_riC8qPqjOEsA9tLzIgdwmw_RxObn06j";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);