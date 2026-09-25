-- DEVELOPMENT DATA ONLY. Invented tickers and market caps (is_mock = true)
-- so a fresh project has an inhabited map. Not real tokens.
insert into public.tokens (state_id, name, symbol, market_cap, color, is_mock) values
  ('TX','Lone Star','LONE',4820291,'#293B4A',true),
  ('TX','Cattle Drive','COW',1212400,'#843F34',true),
  ('TX','Yeehaw Coin','YEE',402110,'#B28B4D',true),
  ('CA','Golden','GOLDEN',5204880,'#B28B4D',true),
  ('CA','Pacific Coast','PCH',2118020,'#293B4A',true),
  ('CA','Avocado','AVO',1050300,'#5E6B4E',true),
  ('FL','Sunshine','SUN',3712550,'#843F34',true),
  ('FL','Gator','GATOR',706900,'#5E6B4E',true),
  ('NY','Empire','EMPIRE',3210760,'#293B4A',true),
  ('NY','Bodega Cat','BODEGA',1904100,'#674A34',true),
  ('AZ','Desert Dust','DUST',1402300,'#9A5A3A',true),
  ('NV','The Strip','STRIP',2104900,'#674A34',true),
  ('NV','Area 51','ALIEN',1630000,'#4A5A5E',true),
  ('OH','Buckeye','BUCK',812400,'#843F34',true),
  ('OH','Cornfield','CORN',760100,'#B28B4D',true),
  ('CO','Fourteener','PEAK',940000,'#4A5A5E',true),
  ('WA','Evergreen','FIR',1120000,'#5E6B4E',true),
  ('IL','Windy City','WIND',1480000,'#293B4A',true),
  ('GA','Peach','PEACH',870300,'#9A5A3A',true),
  ('TN','Honky Tonk','TONK',690000,'#674A34',true)
on conflict (state_id, symbol) do nothing;
