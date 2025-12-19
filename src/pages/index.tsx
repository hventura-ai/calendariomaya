import Head from 'next/head';
import { useMemo, useState } from 'react';

type LongCount = {
  baktun: number;
  katun: number;
  tun: number;
  uinal: number;
  kin: number;
};

type Tzolkin = {
  number: number;
  name: string;
};

type Haab = {
  day: number;
  month: string;
};

const MAYAN_EPOCH_JDN = 584283;
const TZOLKIN_NAMES = [
  'Imix',
  'Ikʼ',
  'Akʼbʼal',
  'Kʼan',
  'Chikchan',
  'Kimi',
  'Manikʼ',
  'Lamat',
  'Muluk',
  'Ok',
  'Chuwen',
  'Ebʼ',
  'Bʼen',
  'Ix',
  'Men',
  'Kibʼ',
  'Kabʼan',
  'Etzʼnabʼ',
  'Kawak',
  'Ajaw'
];

const HAAB_MONTHS = [
  'Pop',
  'Woʼ',
  'Sip',
  'Sotzʼ',
  'Sek',
  'Xul',
  'Yaxkʼinʼ',
  'Mol',
  'Chʼen',
  'Yax',
  'Sakʼ',
  'Keh',
  'Mak',
  'Kʼankʼin',
  'Muwan',
  'Pax',
  'Kʼayabʼ',
  'Kumkʼu',
  'Wayebʼ'
];

const formatLongCount = (count: LongCount) =>
  `${count.baktun}.${count.katun}.${count.tun}.${count.uinal}.${count.kin}`;

function toJulianDay(dateString: string): number | null {
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function calculateLongCount(daysSinceEpoch: number): LongCount {
  const baktun = Math.floor(daysSinceEpoch / 144000);
  const katun = Math.floor((daysSinceEpoch % 144000) / 7200);
  const tun = Math.floor((daysSinceEpoch % 7200) / 360);
  const uinal = Math.floor((daysSinceEpoch % 360) / 20);
  const kin = daysSinceEpoch % 20;

  return { baktun, katun, tun, uinal, kin };
}

function calculateTzolkin(daysSinceEpoch: number): Tzolkin {
  const number = ((daysSinceEpoch + 3) % 13) + 1; // 0.0.0.0.0 es 4 Ajaw
  const nameIndex = (daysSinceEpoch + 19) % 20;
  return { number, name: TZOLKIN_NAMES[nameIndex] };
}

function calculateHaab(daysSinceEpoch: number): Haab {
  const haabDay = (daysSinceEpoch + 348) % 365; // 0.0.0.0.0 es 8 Kumkʼu

  if (haabDay >= 360) {
    return { day: haabDay - 360, month: HAAB_MONTHS[18] };
  }

  const month = Math.floor(haabDay / 20);
  const day = haabDay % 20;
  return { day, month: HAAB_MONTHS[month] };
}

function useMayanDate(dateString: string) {
  return useMemo(() => {
    const jdn = toJulianDay(dateString);

    if (jdn === null) {
      return null;
    }

    const daysSinceEpoch = jdn - MAYAN_EPOCH_JDN;
    if (daysSinceEpoch < 0) {
      return null;
    }

    return {
      longCount: calculateLongCount(daysSinceEpoch),
      tzolkin: calculateTzolkin(daysSinceEpoch),
      haab: calculateHaab(daysSinceEpoch),
      julianDay: jdn
    };
  }, [dateString]);
}

export default function Home() {
  const defaultValue = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [dateInput, setDateInput] = useState(defaultValue);
  const mayan = useMayanDate(dateInput);

  return (
    <>
      <Head>
        <title>Calendario Maya interactivo</title>
        <meta
          name="description"
          content="Convierte fechas gregorianas a cuenta larga, Tzolkʼin y Haab con un visualizador moderno."
        />
      </Head>

      <main className="main">
        <section className="hero">
          <div className="hero-text">
            <h1>Calendario Maya</h1>
            <p>
              Explora las tres cuentas principales —Cuenta Larga, Tzolkʼin y Haab— y convierte cualquier
              fecha gregoriana a su equivalente en el calendario mesoamericano.
            </p>
            <div className="form">
              <label htmlFor="date">Fecha gregoriana</label>
              <input
                id="date"
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="input"
              />
              <button className="button" type="button" onClick={() => setDateInput(defaultValue)}>
                Hoy
              </button>
            </div>
            {!mayan && <p className="badge">Selecciona una fecha válida posterior a 11/08/3114 a.C.</p>}
          </div>
          <div className="hero-card">
            <div className="badge">Resumen</div>
            {mayan ? (
              <>
                <h2 style={{ margin: '0 0 8px' }}>Cuenta Larga</h2>
                <p style={{ margin: '0 0 16px', fontSize: 28, fontWeight: 700 }}>
                  {formatLongCount(mayan.longCount)}
                </p>
                <div className="grid" style={{ marginBottom: 0 }}>
                  <div className="card">
                    <p className="badge">Tzolkʼin</p>
                    <h3 style={{ margin: 0 }}>
                      {mayan.tzolkin.number} {mayan.tzolkin.name}
                    </h3>
                    <p>Ritual de 260 días.</p>
                  </div>
                  <div className="card">
                    <p className="badge">Haab</p>
                    <h3 style={{ margin: 0 }}>
                      {mayan.haab.day} {mayan.haab.month}
                    </h3>
                    <p>Ciclo solar de 365 días.</p>
                  </div>
                </div>
              </>
            ) : (
              <p>Introduce una fecha posterior al 11 de agosto de 3114 a.C.</p>
            )}
          </div>
        </section>

        <section>
          <div className="grid">
            <div className="card">
              <h3>Cuenta Larga</h3>
              <p>
                Mide los días transcurridos desde 0.0.0.0.0 (11 de agosto de 3114 a.C.) en unidades
                jerárquicas: kin (1), uinal (20), tun (360), katun (7&nbsp;200) y baktun (144&nbsp;000).
              </p>
            </div>
            <div className="card">
              <h3>Tzolkʼin</h3>
              <p>
                Calendario ritual de 260 días que combina 13 números con 20 nombres de día. La fecha base
                es 4 Ajaw.
              </p>
            </div>
            <div className="card">
              <h3>Haab</h3>
              <p>
                Calendario solar de 365 días dividido en 18 meses de 20 días y un periodo final de 5 días
                llamado Wayebʼ. La fecha base es 8 Kumkʼu.
              </p>
            </div>
          </div>
        </section>

        {mayan && (
          <section>
            <div className="grid">
              <div className="card">
                <p className="badge">Cuenta Larga</p>
                <h3 style={{ margin: '0 0 12px' }}>{formatLongCount(mayan.longCount)}</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Unidad</th>
                      <th>Días</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Baktun</td>
                      <td>144,000</td>
                      <td>{mayan.longCount.baktun}</td>
                    </tr>
                    <tr>
                      <td>Katun</td>
                      <td>7,200</td>
                      <td>{mayan.longCount.katun}</td>
                    </tr>
                    <tr>
                      <td>Tun</td>
                      <td>360</td>
                      <td>{mayan.longCount.tun}</td>
                    </tr>
                    <tr>
                      <td>Uinal</td>
                      <td>20</td>
                      <td>{mayan.longCount.uinal}</td>
                    </tr>
                    <tr>
                      <td>Kin</td>
                      <td>1</td>
                      <td>{mayan.longCount.kin}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="card">
                <p className="badge">Tzolkʼin</p>
                <h3 style={{ margin: '0 0 4px' }}>
                  {mayan.tzolkin.number} {mayan.tzolkin.name}
                </h3>
                <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>Ciclo de 260 días</p>
                <p>
                  Los números rotan del 1 al 13 mientras los nombres avanzan en secuencia. Esta combinación
                  genera 260 posibles fechas ceremoniales.
                </p>
              </div>

              <div className="card">
                <p className="badge">Haab</p>
                <h3 style={{ margin: '0 0 4px' }}>
                  {mayan.haab.day} {mayan.haab.month}
                </h3>
                <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>Ciclo solar de 365 días</p>
                <p>
                  Cada mes tiene 20 días (0–19), excepto Wayebʼ que solo tiene 5. El conteo solar armoniza
                  la vida civil con las estaciones.
                </p>
              </div>
            </div>
          </section>
        )}

        <p className="footer">Hecho con Next.js 14 y amor por la astronomía mesoamericana.</p>
      </main>
    </>
  );
}
