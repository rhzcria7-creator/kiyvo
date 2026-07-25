-- KIYVO v0.0.1 — contador persistente e atômico por identificador/endpoint.
create or replace function public.check_rate_limit_v001(p_identifier_hash text, p_endpoint text, p_limit integer, p_window_seconds integer)
returns table(allowed boolean, remaining integer, retry_after integer)
language plpgsql security definer set search_path=public as $$
declare bucket timestamptz; current_count integer; wait_seconds integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then raise exception 'INVALID_RATE_LIMIT'; end if;
  bucket := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into rate_limits(identifier_hash, endpoint, window_start, request_count)
  values(p_identifier_hash, p_endpoint, bucket, 1)
  on conflict(identifier_hash, endpoint, window_start) do update set request_count=rate_limits.request_count+1
  returning request_count into current_count;
  wait_seconds := greatest(1, extract(epoch from (bucket + make_interval(secs => p_window_seconds) - now()))::integer);
  return query select current_count <= p_limit, greatest(0, p_limit-current_count), wait_seconds;
end; $$;
revoke all on function public.check_rate_limit_v001(text,text,integer,integer) from public;
grant execute on function public.check_rate_limit_v001(text,text,integer,integer) to service_role;
