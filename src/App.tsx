import * as Dialog from "@radix-ui/react-dialog";
import * as RadioGroup from "@radix-ui/react-radio-group";
import {
  ArrowRight,
  Building,
  Building2,
  ExternalLink,
  Home,
  Info,
  Map,
  Menu,
  PanelsTopLeft,
  Plus,
  RotateCcw,
  TrainFront,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { calculateEstimate } from "./engine/calculator";
import type {
  BuildingFunction,
  EstimateResult,
  HomeType,
  Scheme,
} from "./engine/types";

const schemes: Array<{
  code: Scheme;
  name: string;
  group: string;
  description: string;
}> = [
  {
    code: "NB",
    name: "New Building",
    group: "Buildings",
    description: "A new building in the design or construction stage",
  },
  {
    code: "EB",
    name: "Existing Building",
    group: "Buildings",
    description: "An existing building that is already in operation",
  },
  {
    code: "IS",
    name: "Interior Space",
    group: "Interior",
    description: "An interior space or tenant fit-out",
  },
  {
    code: "TS",
    name: "Transit Station",
    group: "Buildings",
    description: "A station or public transit facility",
  },
  {
    code: "HOMES_A",
    name: "Homes — Individual",
    group: "Residential",
    description: "A single residential property",
  },
  {
    code: "HOMES_B",
    name: "Homes — Developer",
    group: "Residential",
    description: "A residential development with one or more home types",
  },
  {
    code: "NH_PLAN",
    name: "Neighborhood — Plan",
    group: "Neighborhood",
    description: "A neighborhood masterplan that is not yet fully developed",
  },
  {
    code: "NH_BUILT",
    name: "Neighborhood — Built",
    group: "Neighborhood",
    description: "A developed or operational neighborhood",
  },
];

const idr = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const areaInputNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 15,
});

function SchemeIcon({ scheme }: { scheme: Scheme }) {
  const Icon =
    scheme === "NB"
      ? Building2
      : scheme === "EB"
        ? Building
        : scheme === "IS"
          ? PanelsTopLeft
          : scheme === "TS"
            ? TrainFront
            : scheme === "NH_PLAN" || scheme === "NH_BUILT"
              ? Map
              : Home;
  return <Icon size={18} strokeWidth={1.9} aria-hidden="true" />;
}

function parseLocaleNumber(value: string) {
  const normalized = value.trim().replace(/\s/g, "").replace(/,/g, "");
  return Number(normalized);
}

function formatWeightedArea(value: number) {
  const rounded = Math.round(value * 100) / 100;
  const threshold = value > 200 && rounded <= 200 ? 200 : value > 100 && rounded <= 100 ? 100 : null;
  if (threshold !== null) {
    const precise = Number(value.toFixed(6));
    return precise <= threshold ? `> ${threshold}` : areaInputNumber.format(precise);
  }
  return number.format(value);
}

function initialScheme(): Scheme | null {
  const code = new URLSearchParams(window.location.search).get(
    "scheme",
  ) as Scheme | null;
  return schemes.some((item) => item.code === code) ? code : null;
}

export function App() {
  const [scheme, setSchemeState] = useState<Scheme>(initialScheme() ?? "NB");
  const [sheetOpen, setSheetOpen] = useState(false);

  function chooseScheme(code: Scheme) {
    setSchemeState(code);
    setSheetOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("scheme", code);
    history.replaceState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app">
      <Header />
      <CalculatorPage
        scheme={scheme}
        onScheme={chooseScheme}
        onMenu={() => setSheetOpen(true)}
      />
      <SchemeSheet
        open={sheetOpen}
        onOpen={setSheetOpen}
        scheme={scheme}
        onChoose={chooseScheme}
      />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-texture" aria-hidden="true" />
      <div className="header-inner">
        <a
          className="brand"
          href="https://gbcindonesia.org"
          aria-label="Visit GBC Indonesia"
        >
          <img src="/assets/gbci-brand-light.webp" alt="GBC Indonesia" />
        </a>
      </div>
    </header>
  );
}

function SchemeList({
  current,
  onChoose,
}: {
  current: Scheme | null;
  onChoose: (s: Scheme) => void;
}) {
  return (
    <div className="scheme-list">
      {["Buildings", "Interior", "Residential", "Neighborhood"].map((group) => (
        <section key={group}>
          <h3>{group}</h3>
          {schemes
            .filter((s) => s.group === group)
            .map((s) => (
              <button
                className={s.code === current ? "active" : ""}
                onClick={() => onChoose(s.code)}
                key={s.code}
              >
                <span className="scheme-icon">
                  <SchemeIcon scheme={s.code} />
                </span>
                <div>
                  <b>{s.name}</b>
                  <small>{s.description}</small>
                </div>
              </button>
            ))}
        </section>
      ))}
    </div>
  );
}

function SchemeSheet({
  open,
  onOpen,
  scheme,
  onChoose,
}: {
  open: boolean;
  onOpen: (v: boolean) => void;
  scheme: Scheme | null;
  onChoose: (s: Scheme) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="scheme-sheet">
          <div className="sheet-head">
            <Dialog.Title>Select a GREENSHIP scheme</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close">
              <X />
            </Dialog.Close>
          </div>
          <SchemeList current={scheme} onChoose={onChoose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CalculatorPage({
  scheme,
  onScheme,
  onMenu,
}: {
  scheme: Scheme;
  onScheme: (s: Scheme) => void;
  onMenu: () => void;
}) {
  const meta = schemes.find((s) => s.code === scheme)!;
  return (
    <main className="calculator-shell">
      <aside className="scheme-rail">
        <SchemeList current={scheme} onChoose={onScheme} />
      </aside>
      <section className="calculator-main">
        <div className="page-title">
          <div>
            <span className="scheme-code" aria-label={`${meta.name} icon`}>
              <SchemeIcon scheme={scheme} />
            </span>
          </div>
          <h1>{meta.name}</h1>
        </div>
        <button
          className="secondary-button mobile-scheme-button"
          onClick={onMenu}
        >
          <Menu size={17} /> Select another scheme
        </button>
        <Calculator key={scheme} scheme={scheme} />
      </section>
    </main>
  );
}

function Calculator({ scheme }: { scheme: Scheme }) {
  const [area, setArea] = useState("");
  const [fn, setFn] = useState<BuildingFunction>("office");
  const [unit, setUnit] = useState<"ha" | "m2">("ha");
  const [homeTypes, setHomeTypes] = useState<HomeType[]>([]);
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const needsFunction = scheme === "NB" || scheme === "EB" || scheme === "IS";
  const isNeighborhood = scheme === "NH_PLAN" || scheme === "NH_BUILT";
  const isDeveloper = scheme === "HOMES_B";
  const parsedArea = parseLocaleNumber(area);
  const areaHa =
    isNeighborhood && unit === "m2" ? parsedArea / 10_000 : parsedArea;
  const result = useMemo(() => {
    try {
      if (isDeveloper) return calculateEstimate({ scheme, homeTypes });
      if (!area || !Number.isFinite(parsedArea)) return null;
      return calculateEstimate({
        scheme,
        area: isNeighborhood ? areaHa : parsedArea,
        buildingFunction: fn,
      });
    } catch (e) {
      return null;
    }
  }, [
    area,
    areaHa,
    fn,
    homeTypes,
    isDeveloper,
    isNeighborhood,
    parsedArea,
    scheme,
  ]);

  useEffect(() => {
    setError("");
  }, [area, fn, homeTypes]);
  function validate() {
    try {
      calculateEstimate(
        isDeveloper
          ? { scheme, homeTypes }
          : {
              scheme,
              area: isNeighborhood ? areaHa : parsedArea,
              buildingFunction: fn,
            },
      );
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Review the project information and try again.",
      );
    }
  }
  function switchUnit(next: "ha" | "m2") {
    if (next === unit) return;
    if (area && Number.isFinite(parsedArea))
      setArea(
        areaInputNumber.format(
          next === "m2" ? parsedArea * 10_000 : parsedArea / 10_000,
        ),
      );
    setUnit(next);
  }
  function reset() {
    setArea("");
    setFn("office");
    setHomeTypes([]);
    setError("");
    setResetOpen(false);
  }
  const hasEnteredData = Boolean(area || homeTypes.length);

  return (
    <div className="work-grid">
      <section className="form-panel">
        <div className="panel-heading">
          <div>
            <h2>Project details</h2>
          </div>
          <button
            className="reset-button"
            onClick={() => (hasEnteredData ? setResetOpen(true) : reset())}
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
        {needsFunction && (
          <Field
            label="Primary building function"
          >
            <RadioGroup.Root
              className="segmented"
              value={fn}
              onValueChange={(v) => setFn(v as BuildingFunction)}
            >
              <RadioGroup.Item value="office">Office</RadioGroup.Item>
              <RadioGroup.Item value="other">
                Commercial / Healthcare / Hospitality
              </RadioGroup.Item>
            </RadioGroup.Root>
          </Field>
        )}
        {isDeveloper ? (
          <HomeTypes value={homeTypes} onChange={setHomeTypes} />
        ) : (
          <Field
            label={
              isNeighborhood
                ? "Neighborhood area"
                : scheme === "HOMES_A"
                  ? "Gross floor area"
                  : "Gross project area"
            }
            hint={minimumHint(scheme)}
          >
            <div className="number-control">
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                onBlur={() => {
                  validate();
                  if (Number.isFinite(parsedArea))
                    setArea(areaInputNumber.format(parsedArea));
                }}
                inputMode="decimal"
                type="text"
                placeholder="Enter area"
                aria-invalid={Boolean(error)}
              />
              <span>{isNeighborhood ? unit : "m²"}</span>
            </div>
            {isNeighborhood && (
              <div className="unit-switch" aria-label="Area unit">
                <button
                  className={unit === "ha" ? "active" : ""}
                  onClick={() => switchUnit("ha")}
                >
                  Hectares
                </button>
                <button
                  className={unit === "m2" ? "active" : ""}
                  onClick={() => switchUnit("m2")}
                >
                  Square metres
                </button>
              </div>
            )}
          </Field>
        )}
        {error && (
          <div className="error-alert" role="alert">
            <Info size={17} />
            {error}
          </div>
        )}
        {result && (
          <div className="active-rule">
            <b>{result.bracketLabel}</b>
            <small>{ruleHelp(scheme, result)}</small>
          </div>
        )}
        {!result && (
          <button
            className="primary-button calculate-button"
            onClick={validate}
          >
            Calculate donation <ArrowRight size={18} />
          </button>
        )}
      </section>
      <ResultPanel result={result} scheme={scheme} />
      <Dialog.Root open={resetOpen} onOpenChange={setResetOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="confirm-dialog">
            <Dialog.Title>Start a new calculation?</Dialog.Title>
            <Dialog.Description>
              All entered project information will be permanently cleared.
            </Dialog.Description>
            <div className="confirm-actions">
              <Dialog.Close className="secondary-button">Cancel</Dialog.Close>
              <button className="primary-button" onClick={reset}>
                Clear and start again
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {hint && <p>{hint}</p>}
      {children}
    </div>
  );
}

function HomeTypes({
  value,
  onChange,
}: {
  value: HomeType[];
  onChange: (v: HomeType[]) => void;
}) {
  function add() {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        name: `Type ${String.fromCharCode(65 + value.length)}`,
        units: 0,
        floorArea: 0,
      },
    ]);
  }
  function update(id: string, key: keyof HomeType, raw: string) {
    onChange(
      value.map((v) =>
        v.id === id ? { ...v, [key]: key === "name" ? raw : Number(raw) } : v,
      ),
    );
  }
  return (
    <div className="home-types">
      <div className="types-intro">
        <button className="secondary-button" onClick={add}>
          <Plus size={17} /> Add home type
        </button>
      </div>
      {value.length === 0 ? (
        <div className="empty-state">
          <Home size={28} />
          <b>Add a home type to begin</b>
        </div>
      ) : (
        <div className="type-table">
          <div className="type-head">
            <span>Type name</span>
            <span>Number of units</span>
            <span>Area per unit</span>
            <span />
          </div>
          {value.map((type, index) => (
            <div className="type-row" key={type.id}>
              <input
                aria-label={`Name of home type ${index + 1}`}
                value={type.name}
                onChange={(e) => update(type.id, "name", e.target.value)}
              />
              <input
                aria-label={`Number of units for ${type.name}`}
                type="number"
                min="1"
                step="1"
                value={type.units || ""}
                onChange={(e) => update(type.id, "units", e.target.value)}
                placeholder="0"
              />
              <div className="inline-unit">
                <input
                  aria-label={`Floor area for ${type.name}`}
                  type="number"
                  min="0"
                  value={type.floorArea || ""}
                  onChange={(e) => update(type.id, "floorArea", e.target.value)}
                  placeholder="0"
                />
                <span>m²</span>
              </div>
              <button
                className="icon-button danger"
                onClick={() => onChange(value.filter((v) => v.id !== type.id))}
                aria-label={`Remove ${type.name}`}
              >
                <X size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  result,
  scheme,
}: {
  result: EstimateResult | null;
  scheme: Scheme;
}) {
  if (!result)
    return (
      <aside className="result-panel empty-result">
        <div>
          <h2>Donation result</h2>
          <p>Enter the project details to calculate.</p>
        </div>
        <div className="empty-measure">
          <span />
          <span />
          <span />
          <span />
        </div>
      </aside>
    );
  const capped = !["IS", "HOMES_A", "HOMES_B"].includes(scheme);
  const position = Math.min(100, (result.total / 500_000_000) * 100);
  return (
    <>
      <aside className="result-panel" id="result-panel" aria-live="polite">
        <div className="result-top">
          <h2>{idr.format(result.total)}</h2>
          <p>{`${schemes.find((s) => s.code === scheme)?.name} scheme · ${result.bracketLabel}`}</p>
        </div>
        {capped && (
          <div className="measure">
            <div className="measure-labels">
              <span>Rp0</span>
              <span>Rp500 million limit</span>
            </div>
            <div className="measure-track">
              <span style={{ width: `${position}%` }} />
              <i style={{ left: `${position}%` }} />
            </div>
          </div>
        )}
        <div className="breakdown">
          <h3>Donation calculation</h3>
          {result.lineItems.map((item, i) => (
            <div key={`${item.label}-${i}`}>
              <span>{item.label}</span>
              <b>
                {item.amount !== undefined
                  ? idr.format(item.amount)
                  : item.value}
              </b>
            </div>
          ))}
          {result.multiplier && (
            <div>
              <span>Weighted-area multiplier</span>
              <b>× {result.multiplier}</b>
            </div>
          )}
          {result.weightedAverageArea && (
            <div>
              <span>Weighted average area</span>
              <b>{formatWeightedArea(result.weightedAverageArea)} m²</b>
            </div>
          )}
          <div className="total-line">
            <span>Exact donation</span>
            <b>{idr.format(result.total)}</b>
          </div>
        </div>
        {result.warnings.map((w) => (
          <div className="warning-alert" key={w}>
            <Info size={17} />
            {w}
          </div>
        ))}
        <div className="exclusion">
          <b>Transportation and accommodation are not included</b>
          <p>
            Verifier transportation and accommodation outside Greater Jakarta
            are determined separately for each project.
          </p>
        </div>
        <div className="result-actions">
          <a
            className="primary-button"
            href="https://gbcindonesia.org"
            target="_blank"
            rel="noreferrer noopener"
          >
            Proceed to GBC Indonesia <ExternalLink size={17} />
          </a>
        </div>
      </aside>
      <div className="mobile-summary">
        <span>
          <small>Exact donation</small>
          <b>{idr.format(result.total)}</b>
        </span>
        <a href="#result-panel">View details</a>
      </div>
    </>
  );
}

function minimumHint(scheme: Scheme) {
  if (scheme === "IS") return "Minimum 25 m².";
  if (scheme === "HOMES_A") return "Enter the gross floor area of the home.";
  if (scheme === "NH_PLAN")
    return "Minimum 10 ha. Select hectares or square metres.";
  if (scheme === "NH_BUILT")
    return "Minimum 1 ha. Select hectares or square metres.";
  return "Minimum 250 m².";
}

function ruleHelp(scheme: Scheme, result: EstimateResult) {
  if (scheme === "HOMES_B" && result.weightedAverageArea)
    return `The weighted average area is ${formatWeightedArea(result.weightedAverageArea)} m², with a multiplier of ${result.multiplier}.`;
  if (result.capApplied)
    return "The maximum donation limit has been applied to this exact calculation.";
  if (scheme.startsWith("NH_"))
    return "The donation is calculated by interpolation within the applicable area band.";
  return "This exact calculation uses the applicable area band and selected project function.";
}

function Footer() {
  return (
    <footer>
      <span>© 2026 GBC Indonesia</span>
    </footer>
  );
}
