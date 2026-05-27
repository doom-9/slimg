import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";
import { GlobeIcon } from "./icons";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = (SUPPORTED_LANGUAGES as readonly string[]).includes(i18n.resolvedLanguage ?? "")
    ? i18n.resolvedLanguage
    : "en";

  return (
    <label className="lang" title={t("language.label")}>
      <GlobeIcon className="lang__icon" />
      <span className="lang__sr">{t("language.label")}</span>
      <select
        className="lang__select"
        value={current}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
      >
        {SUPPORTED_LANGUAGES.map((lng) => (
          <option key={lng} value={lng}>
            {t(`language.${lng}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
