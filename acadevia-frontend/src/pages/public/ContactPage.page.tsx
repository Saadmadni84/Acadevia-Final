import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COMPANY_CONTACT } from '@/config/footer.config';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  Users,
  Building,
  GraduationCap,
} from 'lucide-react';

interface ContactFormData {
  fullName: string;
  email: string;
  userType: 'STUDENT' | 'PARENT' | 'TEACHER' | 'INSTITUTION' | 'OTHER';
  subject: string;
  message: string;
}

const initialForm: ContactFormData = {
  fullName: '',
  email: '',
  userType: 'STUDENT',
  subject: '',
  message: '',
};

const ContactPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState<ContactFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const validate = () => {
    const errs: Partial<Record<keyof ContactFormData, string>> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim()) {
      errs.message = 'Message cannot be empty';
    } else if (formData.message.trim().length < 15) {
      errs.message = 'Message must be at least 15 characters long';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    setLoading(true);
    // Simulate structured handler for future API integration
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      toast.success('Thank you! Your message has been sent successfully.');
      setFormData(initialForm);
    } catch {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 border border-primary-100 dark:border-primary-800 text-xs sm:text-sm font-semibold mb-6"
        >
          <HelpCircle className="h-4 w-4 text-secondary" />
          <span>We're Here to Help</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight"
        >
          Get in Touch with <span className="text-primary dark:text-primary-300">Acadevia</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
          Have a question, feedback, or need assistance? Our support team is here to assist students, parents, educators, and institutions.
        </motion.p>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Contact Information
            </h2>

            {/* Email Card */}
            <Card hoverable className="p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Email Support
                </h3>
                <a
                  href={`mailto:${COMPANY_CONTACT.supportEmail}`}
                  aria-label={`Send email to ${COMPANY_CONTACT.supportEmail}`}
                  className="text-base font-semibold text-primary dark:text-primary-300 hover:underline mt-0.5 block break-all"
                >
                  {COMPANY_CONTACT.supportEmail}
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  General inquiries, academic feedback & technical assistance.
                </p>
              </div>
            </Card>

            {/* Phone Card */}
            <Card hoverable className="p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Student & Parent Helpline
                </h3>
                <div className="mt-1 flex flex-col gap-1">
                  {COMPANY_CONTACT.phones.map((p) => (
                    <a
                      key={p.tel}
                      href={p.tel}
                      aria-label={`Call helpline at ${p.display}`}
                      className="text-base font-semibold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-300 transition-colors w-fit"
                    >
                      {p.display}
                    </a>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {COMPANY_CONTACT.availability}
                </p>
              </div>
            </Card>

            {/* Address Card */}
            <Card hoverable className="p-6 rounded-2xl flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Headquarters
                </h3>
                <a
                  href={COMPANY_CONTACT.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Acadevia headquarters location on Google Maps"
                  className="group block mt-0.5"
                >
                  <p className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-300 transition-colors">
                    {COMPANY_CONTACT.addressLine1}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-300 transition-colors">
                    {COMPANY_CONTACT.addressLine2}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-300 transition-colors">
                    {COMPANY_CONTACT.addressPostal}
                  </p>
                </a>
              </div>
            </Card>

            {/* Support Note */}
            <div className="rounded-2xl bg-secondary/10 border border-secondary/20 p-5 text-sm text-gray-700 dark:text-gray-300 flex items-start gap-3">
              <Clock className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
              <p>
                Our <strong>AI Learning Assistant</strong> is available 24/7 inside your student dashboard for instant homework and concept explanations.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <Card className="p-8 md:p-10 rounded-3xl shadow-lg border border-gray-200/80 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Send Us a Message
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Fill out the form below and an Acadevia specialist will get back to you shortly.
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-center space-y-4"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto" />
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 max-w-md mx-auto">
                    Thank you for contacting Acadevia. Our support team has received your message and will reply within 24 business hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Full Name */}
                  <Input
                    label="Full Name *"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    error={errors.fullName}
                  />

                  {/* Email */}
                  <Input
                    type="email"
                    label="Email Address *"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                  />

                  {/* User Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      I am a *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'STUDENT', label: 'Student', icon: GraduationCap },
                        { id: 'PARENT', label: 'Parent', icon: Users },
                        { id: 'TEACHER', label: 'Teacher', icon: GraduationCap },
                        { id: 'INSTITUTION', label: 'School / Institution', icon: Building },
                        { id: 'OTHER', label: 'Other', icon: HelpCircle },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              userType: item.id as ContactFormData['userType'],
                            })
                          }
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                            formData.userType === item.id
                              ? 'border-primary bg-primary-50 dark:bg-primary-900/40 text-primary dark:text-primary-300 font-semibold shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <Input
                    label="Subject *"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    error={errors.subject}
                  />

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      className={`w-full rounded-xl border bg-white dark:bg-card-dark px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                        errors.message
                          ? 'border-accent focus:border-accent focus:ring-accent/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Describe your inquiry or feedback in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-accent" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={loading}
                    className="w-full sm:w-auto px-8 py-3 font-semibold"
                    rightIcon={<Send className="h-4 w-4" />}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
