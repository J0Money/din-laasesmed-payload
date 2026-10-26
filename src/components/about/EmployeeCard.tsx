import { mediaAlt, mediaUrl } from '@/lib/media'
import type { Employee } from '@/payload-types'

function PlaceholderIcon() {
  return (
    <svg viewBox="0 0 256 256" className="relative z-[1] w-8" aria-hidden>
      <circle cx="128" cy="96" r="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
      <path d="M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 17 17" fill="none" className="h-4 w-4 shrink-0 text-brand-500" aria-hidden>
      <path
        d="M16.8882 14.6244C15.8091 12.7767 14.1241 11.3369 12.1044 10.537C13.1088 9.80209 13.8507 8.77751 14.225 7.60838C14.5993 6.43925 14.5871 5.18485 14.1901 4.02286C13.7931 2.86087 13.0314 1.85021 12.0129 1.13403C10.9944 0.417855 9.7708 0.0324707 8.51534 0.0324707C7.25987 0.0324707 6.03623 0.417855 5.01774 1.13403C3.99926 1.85021 3.23756 2.86087 2.84055 4.02286C2.44353 5.18485 2.43133 6.43925 2.80567 7.60838C3.18001 8.77751 3.92191 9.80209 4.92628 10.537C2.90659 11.3369 1.22156 12.7767 0.142452 14.6244C0.0755864 14.7293 0.0310207 14.8462 0.0114044 14.9683C-0.00821182 15.0903 -0.00247826 15.2149 0.0282644 15.3348C0.059007 15.4546 0.114131 15.5672 0.190359 15.6658C0.266588 15.7644 0.362364 15.8471 0.471995 15.9089C0.581626 15.9707 0.702873 16.0103 0.828528 16.0255C0.954183 16.0407 1.08168 16.031 1.20344 15.9972C1.3252 15.9633 1.43874 15.9059 1.53731 15.8284C1.63587 15.7508 1.71746 15.6547 1.7772 15.5458C3.20338 13.1409 5.72201 11.7065 8.51534 11.7065C11.3087 11.7065 13.8273 13.1416 15.2535 15.5458C15.383 15.749 15.5883 15.895 15.8262 15.9531C16.064 16.0112 16.3157 15.9767 16.528 15.8571C16.7403 15.7374 16.8966 15.5419 16.9638 15.3119C17.031 15.0818 17.0039 14.8353 16.8882 14.6244ZM4.42256 5.87062C4.42256 5.08089 4.66259 4.3089 5.11232 3.65226C5.56204 2.99562 6.20124 2.48384 6.9491 2.18162C7.69696 1.8794 8.51988 1.80033 9.3138 1.9544C10.1077 2.10847 10.837 2.48876 11.4094 3.04718C11.9818 3.6056 12.3716 4.31708 12.5295 5.09164C12.6874 5.86619 12.6063 6.66904 12.2966 7.39866C11.9868 8.12827 11.4622 8.75189 10.7892 9.19064C10.1161 9.62939 9.32481 9.86357 8.51534 9.86357C7.43025 9.86235 6.38996 9.44128 5.62269 8.69272C4.85541 7.94416 4.42381 6.92924 4.42256 5.87062Z"
        fill="currentColor"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    // Ikonet må krympe som på originalen, så "Skriv til <navn>" holder sig på én linje i smalle kort.
    <svg viewBox="0 0 16 13" fill="none" className="w-[1.1rem]" aria-hidden>
      <path
        d="M15.3846 0.532471H0.615385C0.452174 0.532471 0.295649 0.595685 0.180242 0.708207C0.064835 0.820729 0 0.973341 0 1.13247V11.3325C0 11.6507 0.12967 11.956 0.360484 12.181C0.591298 12.406 0.904349 12.5325 1.23077 12.5325H14.7692C15.0957 12.5325 15.4087 12.406 15.6395 12.181C15.8703 11.956 16 11.6507 16 11.3325V1.13247C16 0.973341 15.9352 0.820729 15.8198 0.708207C15.7044 0.595685 15.5478 0.532471 15.3846 0.532471ZM8 6.91872L2.19769 1.73247H13.8023L8 6.91872ZM5.74692 6.53247L1.23077 10.5682V2.49672L5.74692 6.53247ZM6.65769 7.34622L7.58077 8.17497C7.6943 8.27659 7.84281 8.33297 7.99692 8.33297C8.15104 8.33297 8.29954 8.27659 8.41308 8.17497L9.33615 7.34622L13.7977 11.3325H2.19769L6.65769 7.34622ZM10.2531 6.53247L14.7692 2.49597V10.569L10.2531 6.53247Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Medarbejderkort fra originalens Om os (324px ved 1600px): 3:2 foto, titel, navn og "Skriv til <navn>". */
export function EmployeeCard({ employee, fallbackEmail }: { employee: Employee; fallbackEmail: string }) {
  const photoUrl = employee.showImage !== false ? mediaUrl(employee.photo, 'ratio32') : undefined
  const email = employee.mail || fallbackEmail

  return (
    <li className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-[#e4e8ef] bg-surface-form px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-lg bg-surface-muted text-ink-muted">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={mediaAlt(employee.photo) || employee.name}
            loading="lazy"
            className="absolute inset-0 z-[2] h-full w-full object-cover"
          />
        )}
        <PlaceholderIcon />
      </div>
      <div className="flex gap-4">
        <PersonIcon />
        <div className="mb-[3.2px] flex flex-col items-start gap-2">
          {employee.title && (
            <p className="text-sm leading-none font-medium text-brand-500">{employee.title}</p>
          )}
          {/* Webflows standard-h4 giver 10px margin over og under navnet på originalen. */}
          <h4 className="text-trim my-[10px] font-heading text-[18.4px] leading-[27.6px] text-ink-800">
            {employee.name}
          </h4>
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-text-body transition-colors duration-200 hover:text-brand-500"
            >
              <MailIcon />
              <span className="text-sm leading-[21px] font-medium">Skriv til&nbsp;{employee.name}</span>
            </a>
          )}
        </div>
      </div>
    </li>
  )
}
