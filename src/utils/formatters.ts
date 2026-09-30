/**
 * Calcule l'âge exact à partir d'une date de naissance (format YYYY-MM-DD).
 * Retourne par ex. "6 ans 3 mois", "18 mois", ou "32 ans".
 */
export function calculateAge(birthDateStr?: string): string {
  if (!birthDateStr) return '—';
  
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return '—';

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  const days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return '0 an';
  if (years === 0) {
    if (months === 0) return 'Moins d’un mois';
    return `${months} mois`;
  }
  if (years < 10 && months > 0) {
    return `${years} ans ${months} mois`;
  }
  return `${years} ans`;
}

/**
 * Formate une date en français (ex: "30 Septembre 2026")
 */
export function formatDateFr(dateStr?: string, withDayOfWeek: boolean = false): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return dateStr;

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withDayOfWeek ? { weekday: 'long' } : {}),
  };

  return d.toLocaleDateString('fr-FR', options);
}

/**
 * Formate une date courte (ex: "30/09/2026")
 */
export function formatDateCourte(dateStr?: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Formate un montant en devise (ex: "45.000 DT" ou "45 DT")
 */
export function formatCurrency(amount: number, devise: string = 'DT'): string {
  const num = isNaN(amount) ? 0 : amount;
  return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })} ${devise}`;
}

/**
 * Date d'aujourd'hui au format YYYY-MM-DD
 */
export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Heure actuelle au format HH:MM
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Nettoyage d'un numéro de téléphone pour lien tel: ou WhatsApp wa.me
 * Gère les espaces, tirets, parenthèses et indicatif (+216 par défaut si 8 chiffres tunisiens)
 */
export function cleanPhoneNumber(phone?: string, defaultCountryCode = '216'): { cleaned: string; international: string; display: string } {
  if (!phone) return { cleaned: '', international: '', display: '' };

  const raw = phone.replace(/[^0-9+]/g, '');
  let international = raw;

  if (raw.startsWith('+')) {
    international = raw.replace('+', '');
  } else if (raw.startsWith('00')) {
    international = raw.substring(2);
  } else if (raw.length === 8) {
    // Standard format tunisien à 8 chiffres (ex: 98123456 -> 21698123456)
    international = `${defaultCountryCode}${raw}`;
  }

  return {
    cleaned: raw,
    international,
    display: phone.trim(),
  };
}

/**
 * Génère un lien direct WhatsApp wa.me avec message prérempli
 */
export function getWhatsAppLink(phone?: string, message?: string): string {
  const { international } = cleanPhoneNumber(phone);
  if (!international) return '';
  const encodedMsg = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${international}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
}

/**
 * Génère un lien direct d'appel tel:
 */
export function getTelLink(phone?: string): string {
  const { cleaned } = cleanPhoneNumber(phone);
  return cleaned ? `tel:${cleaned}` : '#';
}
