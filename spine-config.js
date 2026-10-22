// Supabase kapcsolat. A kulcs nyilvános (publishable) kulcs: csak olvasásra jogosít,
// az írást a táblák és a Storage RLS-szabályai tiltják.
window.SPINE_CONFIG = {
  supabaseUrl: 'https://qxtnlxtkymhgsduzrsxo.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dG5seHRreW1oZ3NkdXpyc3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTIyNDIsImV4cCI6MjEwODIyODI0Mn0.yrLK1UEKIvtg-ky_Znxz-WPKvpKpt6ZryueR_-FbAsU',
  bucket: 'site-data',
};
