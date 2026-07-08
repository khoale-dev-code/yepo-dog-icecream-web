export default function SectionHeader({ eyebrow, title, description, align = "left", tone = "warm" }) {
  const isInverse = tone === "inverse";

  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={`text-xs font-semibold uppercase tracking-[0.26em] ${isInverse ? "text-[#ffe169]" : "text-[#b98c49]"}`}>
        {eyebrow}
      </p>
      <h2 className={`font-display mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl ${isInverse ? "text-white" : "text-[#2b1b10]"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-sm leading-7 sm:text-base ${isInverse ? "text-white/70" : "text-[#6f5a3e]"}`}>
          {description}
        </p>
      )}
    </div>
  );
}



