-- ================================================================
-- CuentaRuta — Seed Data (Nelson R. / adahilsoto1@gmail.com)
-- Ejecutar DESPUÉS de crear el usuario en Supabase Auth
-- ================================================================

DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'adahilsoto1@gmail.com';
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado. Crea primero el usuario en Authentication → Users de Supabase.';
  END IF;

  -- Upsert perfil
  INSERT INTO public.cr_usuarios (id, nombre, empresa, rol, plan)
  VALUES (v_uid, 'Nelson R.', 'CHEC', 'conductor', 'trial')
  ON CONFLICT (id) DO UPDATE SET
    nombre    = 'Nelson R.',
    empresa   = 'CHEC',
    rol       = 'conductor',
    plan      = 'trial';

  -- Limpiar datos previos
  DELETE FROM public.cr_trayectos  WHERE conductor_id = v_uid;
  DELETE FROM public.cr_viaticos   WHERE conductor_id = v_uid;
  DELETE FROM public.cr_flujo      WHERE conductor_id = v_uid;
  DELETE FROM public.cr_documentos WHERE conductor_id = v_uid;

  -- ── TRAYECTOS ────────────────────────────────────────────────

  -- SEM 1 (Jan 27–31, 2026)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-01-27',1,'Manizales-Dosquebradas-Chinchiná-Manizales',       'CHEC',19680,19834,'06:29','15:30',9,2,424017,'2523850','pagado'),
  (v_uid,'2026-01-28',1,'Manizales-Dosquebradas-Santa Rosa-Manizales',      'CHEC',19843,19973,'06:18','15:40',9,2,302869,'2523851','pagado'),
  (v_uid,'2026-01-29',1,'Manizales-Chinchiná-Santa Rosa-Manizales',         'CHEC',19984,20108,'06:21','15:42',9,2,302869,'2523852','pagado'),
  (v_uid,'2026-01-30',1,'Manizales-Chinchiná-Dosquebradas-Manizales',       'CHEC',20118,20263,'06:20','15:47',9,2,302869,'2523853','pagado'),
  (v_uid,'2026-01-31',1,'Manizales-Chinchiná-El Trebol-Chinchiná-Manizales','CHEC',20277,20387,'06:26','15:38',9,2,302869,'2523854','pagado');

  -- SEM 2 (Feb 4–7, 2026)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-02-04',2,'Manizales-Chinchiná-Cartagena-Rochela-Manizales',       'CHEC',20494,20604,'06:20','15:44', 9,2,302869,'2523855','pagado'),
  (v_uid,'2026-02-05',2,'Manizales-Santa Rosa-Dosquebradas-Chinchiná-Manizales', 'CHEC',20629,20747,'06:23','16:29',10,2,302869,'2523856','pagado'),
  (v_uid,'2026-02-06',2,'Manizales-Dosquebradas-Santa Rosa-Chinchiná-Manizales', 'CHEC',20768,20923,'06:20','17:10',11,2,424017,'2523857','pagado'),
  (v_uid,'2026-02-07',2,'Manizales-Chinchiná-Manizales',                         'CHEC',20947,21023,'06:23','16:03', 9,2,302869,'2523858','pagado');

  -- SEM 3 (Feb 10–14, 2026)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-02-10',3,'Manizales-Dosquebradas-Santa Rosa-Manizales',          'CHEC',21087,21224,'06:21','15:06',9,2,302869,'2523859','pagado'),
  (v_uid,'2026-02-11',3,'Manizales-Santa Rosa-Dosquebradas-Santa Rosa',         'CHEC',21249,21379,'06:20','15:44',9,2,302869,'2523860','pagado'),
  (v_uid,'2026-02-12',3,'Manizales-Chinchiná-Marcella-Manizales',               'CHEC',21403,21556,'06:21','14:55',9,2,424017,'2523861','pagado'),
  (v_uid,'2026-02-13',3,'Manizales-Dosquebradas-Palestina-Rochela-Manizales',   'CHEC',21587,21753,'06:21','14:00',8,1,424017,'2523862','pagado'),
  (v_uid,'2026-02-14',3,'Manizales-Dosquebradas',                              'CHEC',21784,21899,'06:31','15:27',9,2,302869,'2523863','pagado');

  -- SEM 4 (Feb 17–21, 2026)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-02-17',4,'Manizales-Chinchiná-Manizales',                          'CHEC',21987,22083,'06:21','15:39',9,2,302869,'2523864','pagado'),
  (v_uid,'2026-02-18',4,'Manizales-Chinchiná-Santa Rosa-Manizales',               'CHEC',22111,22242,'06:20','15:40',9,2,302869,'2523865','pagado'),
  (v_uid,'2026-02-19',4,'Manizales-Dosquebradas-Manizales',                       'CHEC',22268,22408,'06:16','15:44',9,2,302869,'2523866','pagado'),
  (v_uid,'2026-02-20',4,'Manizales-Santa Rosa-Dosquebradas-Manizales',            'CHEC',22432,22585,'06:19','15:21',9,2,424017,'2523867','pagado'),
  (v_uid,'2026-02-21',4,'Manizales-Chinchiná-Palestina-Santagueda-Manizales',     'CHEC',22610,22724,'06:20','15:24',9,2,302869,'2523868','pagado');

  -- SEM 5 (Feb 24–28)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-02-24',5,'Manizales-Dosquebradas-Chinchiná-Manizales',         'CHEC',22740,22870,'06:20','15:30', 9,2,302869,'2523869','pagado'),
  (v_uid,'2026-02-25',5,'Manizales-Santa Rosa-Manizales',                     'CHEC',22875,22995,'06:18','15:42', 9,2,302869,'2523870','pagado'),
  (v_uid,'2026-02-27',5,'Manizales-Chinchiná-El Trebol-Manizales',            'CHEC',23000,23140,'06:21','17:00',11,2,424017,'2523871','pagado');

  -- SEM 6 (Mar 3–7)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-03-03',6,'Manizales-Dosquebradas-Santa Rosa-Manizales',        'CHEC',23145,23275,'06:22','15:30', 9,2,302869,'2523872','pagado'),
  (v_uid,'2026-03-04',6,'Manizales-Chinchiná-Manizales',                      'CHEC',23280,23380,'06:20','15:45', 9,2,302869,'2523873','pagado'),
  (v_uid,'2026-03-06',6,'Manizales-Dosquebradas-Palestina-Manizales',         'CHEC',23385,23535,'06:19','17:05',11,2,424017,'2523874','pagado');

  -- SEM 7 (Mar 10–14)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-03-10',7,'Manizales-Santa Rosa-Dosquebradas-Manizales',        'CHEC',23540,23675,'06:20','15:35', 9,2,302869,'2523875','pagado'),
  (v_uid,'2026-03-11',7,'Manizales-Chinchiná-Santa Rosa-Manizales',           'CHEC',23680,23805,'06:18','15:40', 9,2,302869,'2523876','pagado'),
  (v_uid,'2026-03-13',7,'Manizales-Dosquebradas-Rochela-Manizales',           'CHEC',23810,23975,'06:21','17:10',11,2,424017,'2523877','pagado');

  -- SEM 8 (Mar 17–21)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-03-17',8,'Manizales-Chinchiná-Manizales',                      'CHEC',23980,24090,'06:22','15:30', 9,2,302869,'2523878','pagado'),
  (v_uid,'2026-03-18',8,'Manizales-Santa Rosa-Chinchiná-Manizales',           'CHEC',24095,24225,'06:20','15:42', 9,2,302869,'2523879','pagado'),
  (v_uid,'2026-03-20',8,'Manizales-Dosquebradas-Santa Rosa-Manizales',        'CHEC',24230,24390,'06:19','17:08',11,2,424017,'2523880','pagado');

  -- SEM 9 (Mar 24–28)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-03-24',9,'Manizales-Chinchiná-Dosquebradas-Manizales',         'CHEC',24395,24515,'06:21','15:35', 9,2,302869,'2523881','pagado'),
  (v_uid,'2026-03-25',9,'Manizales-Dosquebradas-Santa Rosa-Manizales',        'CHEC',24520,24655,'06:20','15:40', 9,2,302869,'2523882','pagado'),
  (v_uid,'2026-03-27',9,'Manizales-Chinchiná-Palestina-Manizales',            'CHEC',24660,24815,'06:18','16:55',11,2,302869,'2523883','pagado');

  -- SEM 10 (Mar 31–Apr 4)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-03-31',10,'Manizales-Santa Rosa-Dosquebradas-Manizales',       'CHEC',24820,24955,'06:20','15:30', 9,2,424017,'2523884','pagado'),
  (v_uid,'2026-04-01',10,'Manizales-Chinchiná-Manizales',                     'CHEC',24960,25070,'06:22','15:45', 9,2,302869,'2523885','pagado'),
  (v_uid,'2026-04-03',10,'Manizales-Dosquebradas-Chinchiná-Manizales',        'CHEC',25075,25215,'06:21','17:12',11,2,424017,'2523886','pagado');

  -- SEM 11 (Apr 7–11)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-04-07',11,'Manizales-Dosquebradas-Santa Rosa-Manizales',       'CHEC',25220,25355,'06:20','15:35', 9,2,424017,'2523887','pagado'),
  (v_uid,'2026-04-08',11,'Manizales-Chinchiná-Santa Rosa-Dosquebradas-Manizales','CHEC',25360,25505,'06:18','15:40', 9,2,424017,'2523888','pagado'),
  (v_uid,'2026-04-10',11,'Manizales-Santa Rosa-Chinchiná-Palestina-Manizales','CHEC',25510,25685,'06:21','17:10',11,2,424017,'2523889','pagado');

  -- SEM 12 (Apr 14–17)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-04-14',12,'Manizales-Dosquebradas-Manizales',                  'CHEC',25690,25805,'06:22','15:30', 9,2,424017,'2523890','pagado'),
  (v_uid,'2026-04-15',12,'Manizales-Chinchiná-El Trebol-Manizales',           'CHEC',25810,25945,'06:20','15:44', 9,2,302869,'2523891','pagado'),
  (v_uid,'2026-04-17',12,'Manizales-Santa Rosa-Dosquebradas-Chinchiná-Manizales','CHEC',25950,26105,'06:19','17:05',11,2,424017,'2523892','pagado');

  -- SEM 13 (Apr 21–23 — Planta Mayores Esmeralda, pagado)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-04-21',13,'Manizales-Planta Mayores Esmeralda-Manizales','CHEC-Esmeralda',26110,26335,'05:30','23:00',17,5,646000,'2523893','pagado'),
  (v_uid,'2026-04-22',13,'Manizales-Planta Mayores Esmeralda-Manizales','CHEC-Esmeralda',26340,26565,'05:30','23:00',17,5,646000,'2523894','pagado'),
  (v_uid,'2026-04-23',13,'Manizales-Planta Mayores Esmeralda-Manizales','CHEC-Esmeralda',26570,26795,'05:30','23:00',17,5,646000,'2523895','pagado');

  -- SEM 14 (Apr 28–30 — Esmeralda, pendiente)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-04-28',14,'Manizales-Planta Mayores Esmeralda-Manizales','CHEC-Esmeralda',26800,27025,'05:30','23:00',17,5,646000,'2523896','pendiente'),
  (v_uid,'2026-04-29',14,'Manizales-Planta Mayores Esmeralda-Manizales','CHEC-Esmeralda',27030,27255,'05:30','23:00',17,5,646000,'2523897','pendiente'),
  (v_uid,'2026-04-30',14,'Manizales-Planta Mayores Esmeralda-Manizales','CHEC-Esmeralda',27260,27485,'05:30','23:00',17,5,646000,'2523898','pendiente');

  -- SEM 15 (May 5–7 — Esmeralda, pendiente, incompleta)
  INSERT INTO public.cr_trayectos (conductor_id,fecha,semana,ruta,cliente,km_ini,km_fin,hora_ini,hora_fin,horas,extras,valor,factura,estado) VALUES
  (v_uid,'2026-05-05',15,'Manizales-Planta Mayores Esmeralda-Manizales','CHEC-Esmeralda',27490,27715,'05:30','23:00',17,5,646000,'2523899','pendiente');

  -- ── VIÁTICOS ─────────────────────────────────────────────────

  -- SEM 1
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-01-27','ACPM',       157006,'tarjeta'),
  (v_uid,'2026-01-27','Peaje',       16900,'flypass'),
  (v_uid,'2026-01-27','Peaje',       16900,'flypass'),
  (v_uid,'2026-01-28','Peaje',       16900,'flypass'),
  (v_uid,'2026-01-28','Peaje',       16900,'flypass'),
  (v_uid,'2026-01-29','Peaje',       16900,'flypass'),
  (v_uid,'2026-01-29','Peaje',       16900,'flypass'),
  (v_uid,'2026-01-30','Peaje',       16900,'flypass'),
  (v_uid,'2026-01-30','Peaje',       16900,'flypass'),
  (v_uid,'2026-01-30','Montallantas',12000,'efectivo'),
  (v_uid,'2026-01-31','Lavada',      95000,'efectivo');

  -- SEM 2
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-02-04','ACPM',   227588,'tarjeta'),
  (v_uid,'2026-02-04','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-04','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-05','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-05','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-06','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-06','Alimentacion',16000,'efectivo'),
  (v_uid,'2026-02-07','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-07','Alimentacion',18000,'efectivo');

  -- SEM 3
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-02-10','ACPM',   198450,'tarjeta'),
  (v_uid,'2026-02-10','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-10','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-11','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-12','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-12','Alimentacion',15000,'efectivo'),
  (v_uid,'2026-02-13','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-14','Lavada',  45000,'efectivo'),
  (v_uid,'2026-02-14','Alimentacion',14000,'efectivo');

  -- SEM 4
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-02-17','ACPM',   312600,'tarjeta'),
  (v_uid,'2026-02-17','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-18','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-18','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-19','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-20','ACPM',   185000,'tarjeta'),
  (v_uid,'2026-02-20','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-21','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-21','Mantenimiento',120000,'efectivo');

  -- SEM 5
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-02-24','ACPM',   210000,'tarjeta'),
  (v_uid,'2026-02-24','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-25','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-27','Peaje',   17800,'flypass'),
  (v_uid,'2026-02-27','Alimentacion',22000,'efectivo');

  -- SEM 6
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-03-03','ACPM',   95000,'tarjeta'),
  (v_uid,'2026-03-03','Peaje',  17800,'flypass'),
  (v_uid,'2026-03-04','Peaje',  17800,'flypass'),
  (v_uid,'2026-03-06','Lavada', 45000,'efectivo');

  -- SEM 7
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-03-10','ACPM',   245000,'tarjeta'),
  (v_uid,'2026-03-10','Peaje',   17800,'flypass'),
  (v_uid,'2026-03-11','Peaje',   17800,'flypass'),
  (v_uid,'2026-03-13','Alimentacion',28000,'efectivo'),
  (v_uid,'2026-03-13','Peaje',   17800,'flypass');

  -- SEM 8
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-03-17','ACPM',   280000,'tarjeta'),
  (v_uid,'2026-03-17','Peaje',   17800,'flypass'),
  (v_uid,'2026-03-18','Peaje',   17800,'flypass'),
  (v_uid,'2026-03-20','Alimentacion',25000,'efectivo'),
  (v_uid,'2026-03-20','AdBlue',  85000,'tarjeta');

  -- SEM 9
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-03-24','ACPM',   195000,'tarjeta'),
  (v_uid,'2026-03-24','Peaje',   17800,'flypass'),
  (v_uid,'2026-03-25','Peaje',   17800,'flypass'),
  (v_uid,'2026-03-27','Lavada',  65000,'efectivo');

  -- SEM 10
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-03-31','ACPM',   168000,'tarjeta'),
  (v_uid,'2026-03-31','Peaje',   17800,'flypass'),
  (v_uid,'2026-04-01','Peaje',   17800,'flypass'),
  (v_uid,'2026-04-03','Alimentacion',18000,'efectivo');

  -- SEM 11
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-04-07','ACPM',   320000,'tarjeta'),
  (v_uid,'2026-04-07','Peaje',   17800,'flypass'),
  (v_uid,'2026-04-08','Peaje',   17800,'flypass'),
  (v_uid,'2026-04-10','AdBlue',  90000,'tarjeta'),
  (v_uid,'2026-04-10','Alimentacion',24000,'efectivo');

  -- SEM 12
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-04-14','ACPM',   380000,'tarjeta'),
  (v_uid,'2026-04-14','Peaje',   17800,'flypass'),
  (v_uid,'2026-04-15','Peaje',   17800,'flypass'),
  (v_uid,'2026-04-17','Lavada',  95000,'efectivo'),
  (v_uid,'2026-04-17','Hotel',  250000,'efectivo');

  -- SEM 13 (Esmeralda)
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-04-21','ACPM',   180000,'tarjeta'),
  (v_uid,'2026-04-21','Hotel',  200000,'efectivo'),
  (v_uid,'2026-04-22','Alimentacion',45000,'efectivo'),
  (v_uid,'2026-04-23','Peaje',   17800,'flypass');

  -- SEM 14
  INSERT INTO public.cr_viaticos (conductor_id,fecha,concepto,monto,tipo_pago) VALUES
  (v_uid,'2026-04-28','ACPM',   215000,'tarjeta'),
  (v_uid,'2026-04-28','Hotel',  200000,'efectivo'),
  (v_uid,'2026-04-29','Alimentacion',38000,'efectivo'),
  (v_uid,'2026-04-30','Peaje',   17800,'flypass');

  -- ── DOCUMENTOS ───────────────────────────────────────────────
  INSERT INTO public.cr_documentos (conductor_id,nombre,vencimiento,valor,estado) VALUES
  (v_uid,'SOAT',                '2026-01-31',NULL,   'vencido'),
  (v_uid,'Póliza RC',           '2026-02-12',NULL,   'vencido'),
  (v_uid,'Tarjeta de Operación','2026-07-20',NULL,   'vigente'),
  (v_uid,'Tecnomecánica',       '2026-07-25',NULL,   'vigente'),
  (v_uid,'Licencia de Conducción','2028-01-26',540000,'vigente'),
  (v_uid,'Bimestral',           '2026-04-19',NULL,   'vence_pronto');

  -- ── FLUJO SEMANAL ─────────────────────────────────────────────
  INSERT INTO public.cr_flujo (conductor_id,semana,fecha_salida,salidas,fecha_ingreso,ingresos,estado) VALUES
  (v_uid, 1,'2026-01-27',5341312,'2026-01-31',1635493,'pagado'),
  (v_uid, 2,'2026-02-04', 392059,'2026-02-07',1332624,'pagado'),
  (v_uid, 3,'2026-02-10',2228420,'2026-02-14',1756642,'pagado'),
  (v_uid, 4,'2026-02-17',6409207,'2026-02-21',1635493,'pagado'),
  (v_uid, 5,'2026-02-24',2350495,'2026-02-28',1983901,'pagado'),
  (v_uid, 6,'2026-03-03', 661735,'2026-03-07',1971998,'pagado'),
  (v_uid, 7,'2026-03-10',2112056,'2026-03-14',1987980,'pagado'),
  (v_uid, 8,'2026-03-17',2912695,'2026-03-21',1972000,'pagado'),
  (v_uid, 9,'2026-03-24',2249107,'2026-03-28',1700000,'pagado'),
  (v_uid,10,'2026-03-31', 881355,'2026-04-04',2584000,'pagado'),
  (v_uid,11,'2026-04-07',2794134,'2026-04-11',2856000,'pagado'),
  (v_uid,12,'2026-04-14',3667137,'2026-04-17',2710820,'pagado'),
  (v_uid,13,'2026-04-21',1129828,'2026-04-25',3638000,'pagado'),
  (v_uid,14,'2026-04-28',2491238,NULL,         3876000,'pendiente'),
  (v_uid,15,'2026-05-05',      0,NULL,               0,'pendiente');

  RAISE NOTICE 'Seed completado para usuario: %', v_uid;
END;
$$;
