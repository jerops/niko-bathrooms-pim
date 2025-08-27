#!/bin/bash
curl -X POST \
  'https://bzjoxjqfpmjhbfijthpp.supabase.co/storage/v1/object/pim-assets/bundles/niko-pim-auth.min.js' \
  -H 'Authorization: Bearer YOUR_SERVICE_KEY' \
  -H 'Content-Type: application/javascript' \
  --data-binary @packages/pim-bundle/dist/niko-pim-auth.min.js

