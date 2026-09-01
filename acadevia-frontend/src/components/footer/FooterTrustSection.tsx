import React from 'react';
import { COMPANY_CONTACT } from '@/config/footer.config';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const FooterTrustSection: React.FC = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary-50/60 via-purple-50/40 to-primary-50/60 dark:from-primary-950/20 dark:via-purple-950/10 dark:to-primary-950/20 p-6 sm:p-8 border border-primary-100/70 dark:border-primary-900/30">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Support Email */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Email Support
            </h5>
            <a
              href={`mailto:${COMPANY_CONTACT.supportEmail}`}
              aria-label={`Send email to ${COMPANY_CONTACT.supportEmail}`}
              className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary-300 transition-colors block break-all"
            >
              {COMPANY_CONTACT.supportEmail}
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Prompt response within 24 hours</p>
          </div>
        </div>

        {/* Contact Phone */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 shrink-0">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Student Helpline
            </h5>
            <div className="flex flex-col gap-0.5 mt-0.5">
              {COMPANY_CONTACT.phones.map((p) => (
                <a
                  key={p.tel}
                  href={p.tel}
                  aria-label={`Call helpline at ${p.display}`}
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary-300 transition-colors w-fit"
                >
                  {p.display}
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Toll-free student counseling</p>
          </div>
        </div>

        {/* Location / Presence */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Headquarters
            </h5>
            <a
              href={COMPANY_CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Acadevia headquarters location on Google Maps"
              className="group block"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-300 transition-colors">
                {COMPANY_CONTACT.addressLine1}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary-300 transition-colors mt-0.5">
                {COMPANY_CONTACT.addressLine2}, {COMPANY_CONTACT.addressPostal}
              </p>
            </a>
          </div>
        </div>

        {/* Hours / Availability */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Support Hours
            </h5>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Mon – Sat, 9am – 6pm IST</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">24/7 AI learning assistant active</p>
          </div>
        </div>
      </div>
    </div>
  );
};
