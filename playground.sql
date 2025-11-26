INSERT INTO [nama_tabel]
  ([nama_kolom_1], [nama_kolom_2], [nama_kolom_3])
VALUES
  ([nilai_kolom_1], [nilai_kolom_2], [nilai_kolom_3]);

UPDATE [nama_tabel]
  SET [nama_kolom] = [nilai_baru]
WHERE
  [nama_kolom_kondisi] = [nilai_kondisi];

DELETE FROM [nama_tabel]
WHERE
  [nama_kolom_kondisi] = [nilai_kondisi];

SELECT [nama_kolom]
FROM [nama_tabel]
ORDER BY [nama_kolom] ASC;

SELECT [nama_kolom]
FROM [nama_tabel]
WHERE [nama_kolom_kondisi] = [nilai_kondisi];

SELECT [nama_kolom]
FROM [nama_tabel]
LIMIT 10;

-- GROUP BY
SELECT
  [nama_kolom],
  COUNT(*) AS jumlah
FROM [nama_tabel]
GROUP BY [nama_kolom_kategorik];

SELECT
  nama_siswa,
  AVG(nilai_ujian) AS rata_rata_nilai
FROM siswa
GROUP BY nama_siswa;

-- HAVING
SELECT
  nama_siswa,
  AVG(nilai_ujian) AS rata_rata_nilai
FROM siswa
GROUP BY nama_siswa
HAVING rata_rata_nilai > 75;

-- JOIN
SELECT
  a.[nama_kolom],
  b.[nama_kolom]
FROM [tabel_a] AS a
JOIN [tabel_b] AS b ON a.[foreign_key_b] = b.[primary_key_b];