/** Yaş hesaplama (pure function, tarih matematiği). */

export interface YasSonucu {
  yil: number;
  ay: number;
  gun: number;
  toplamGun: number;
}

export function yasHesapla(dogumTarihi: Date, bugun: Date = new Date()): YasSonucu {
  if (!(dogumTarihi instanceof Date) || Number.isNaN(dogumTarihi.getTime())) {
    throw new Error('Geçerli bir doğum tarihi girin.');
  }
  if (dogumTarihi.getTime() > bugun.getTime()) {
    throw new Error('Doğum tarihi bugünden ileri bir tarih olamaz.');
  }
  let yil = bugun.getFullYear() - dogumTarihi.getFullYear();
  let ay = bugun.getMonth() - dogumTarihi.getMonth();
  let gun = bugun.getDate() - dogumTarihi.getDate();
  if (gun < 0) {
    ay -= 1;
    const oncekiAy = new Date(bugun.getFullYear(), bugun.getMonth(), 0);
    gun += oncekiAy.getDate();
  }
  if (ay < 0) {
    yil -= 1;
    ay += 12;
  }
  const toplamGun = Math.floor(
    (bugun.getTime() - dogumTarihi.getTime()) / (1000 * 60 * 60 * 24),
  );
  return { yil, ay, gun, toplamGun };
}
