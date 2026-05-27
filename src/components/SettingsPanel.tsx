import { useTranslation } from "react-i18next";
import type { CompressOptions, OutputFormat } from "../core/types";

interface Props {
  options: CompressOptions;
  onChange: (patch: Partial<CompressOptions>) => void;
  disabled?: boolean;
}

const FORMATS: OutputFormat[] = ["original", "jpeg", "png", "webp"];

export function SettingsPanel({ options, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const showQuality =
    options.format === "jpeg" || options.format === "webp" || options.format === "original";
  const showPngLevel = options.format === "png" || options.format === "original";

  function num(value: string): number | undefined {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  return (
    <fieldset className="settings" disabled={disabled}>
      <div className="settings__row">
        <label className="settings__field">
          <span>{t("settings.format")}</span>
          <select
            value={options.format}
            onChange={(e) => onChange({ format: e.target.value as OutputFormat })}
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {t(`settings.formatOption.${f}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showQuality && (
        <div className="settings__row">
          <label className="settings__field">
            <span>
              {t("settings.quality")}: <strong>{options.quality}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={100}
              value={options.quality}
              onChange={(e) => onChange({ quality: Number(e.target.value) })}
            />
          </label>
        </div>
      )}

      {showPngLevel && (
        <div className="settings__row">
          <label className="settings__field">
            <span>
              {t("settings.pngLevel")}: <strong>{options.pngOptimizationLevel ?? 2}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={6}
              value={options.pngOptimizationLevel ?? 2}
              onChange={(e) => onChange({ pngOptimizationLevel: Number(e.target.value) })}
            />
          </label>
        </div>
      )}

      <div className="settings__row settings__row--split">
        <label className="settings__field">
          <span>{t("settings.maxWidth")}</span>
          <input
            type="number"
            min={1}
            placeholder={t("settings.auto")}
            value={options.maxWidth ?? ""}
            onChange={(e) => onChange({ maxWidth: num(e.target.value) })}
          />
        </label>
        <label className="settings__field">
          <span>{t("settings.maxHeight")}</span>
          <input
            type="number"
            min={1}
            placeholder={t("settings.auto")}
            value={options.maxHeight ?? ""}
            onChange={(e) => onChange({ maxHeight: num(e.target.value) })}
          />
        </label>
      </div>
    </fieldset>
  );
}
