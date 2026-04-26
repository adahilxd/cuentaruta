-- Migración 005: Políticas RLS para bucket "trayectos" (fotos odómetro)
-- Ejecutar en Supabase SQL Editor si el script de setup falla

-- Conductores pueden subir sus propias fotos (ruta: {user_id}/{trayecto_id}/foto_*.jpg)
CREATE POLICY "conductores upload fotos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'trayectos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Conductores pueden reemplazar sus fotos
CREATE POLICY "conductores update fotos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'trayectos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Conductores pueden eliminar sus fotos
CREATE POLICY "conductores delete fotos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'trayectos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lectura pública (bucket es público, pero la policy es necesaria igual)
CREATE POLICY "lectura publica fotos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'trayectos');
