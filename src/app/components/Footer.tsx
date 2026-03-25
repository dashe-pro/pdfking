"use client"

import { useLanguage } from '../contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer>
      <div className="container footer-content">
        <div>
          <p>
            {t('footer.copyright')}
          </p>
        </div>
        <div>
          <a href="#">{t('footer.terms')}</a>
          <a href="#" style={{ margin: '0 1rem' }}>{t('footer.privacy')}</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </footer>
  )
}
