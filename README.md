# MihinKayttaa.fi

Staattinen Cloudflare Pages -sivusto domainille `mihinkayttaa.fi`.

## Cloudflare Pages

- Framework preset: `None`
- Build command: jätä tyhjäksi
- Build output directory: `/`

Jos repo sisältää vain tämän kansion sisällön, output directory on `/`.
Jos tämä kansio lisätään isomman repon alikansioksi, Cloudflaressa projektin root directoryksi kannattaa valita `mihinkayttaa-fi`.

## Yhteydenottolomake

Lomake toimii Cloudflare Pages Functionin kautta osoitteessa `/api/contact`.
Vastaanottajan sähköpostiosoitetta ei tallenneta HTML-sivulle eikä repo-koodiin.

Cloudflare Pagesin ympäristömuuttujat:

- `RESEND_API_KEY`: Resend-palvelun API-avain
- `CONTACT_TO_EMAIL`: vastaanottava sähköpostiosoite
- `CONTACT_FROM_EMAIL`: lähettäjäosoite, esimerkiksi varmennetun domainin `noreply@...`

Resendissä lähettävä domain tai osoite pitää varmentaa ennen kuin lomake lähettää sähköposteja.
