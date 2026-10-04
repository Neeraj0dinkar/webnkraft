# webnKraft rebrand notes

## Brand
- Display brand: webnKraft
- Domain selected by the project owner: https://webnkraft.com/
- Do not rename Supabase technical identifiers such as `project_enquiries` or `notify-new-enquiry`.

## Email
- The included Edge Function source uses `webnKraft <onboarding@resend.dev>` for the current Resend testing setup.
- After `webnkraft.com` is verified in Resend, change the sender to a domain-based address such as `hello@webnkraft.com`.
- Keep `RESEND_API_KEY` in Supabase Edge Function Secrets; never put it in browser code or this repository.

## Admin dashboard
- `admin/dashboard.html` has been rebranded.
- The supplied V3 zip did not contain the separate `dashboard.js`, so its functional logic was not recreated or changed here. Keep using the working dashboard.js already used by the admin dashboard.

## Domain
- The HTML, robots.txt and sitemap now use `https://webnkraft.com/`. Make sure the domain is actually registered and DNS/hosting are configured before launch.
