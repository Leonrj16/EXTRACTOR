import type { DeviceType } from '@prisma/client';

export function detectDevice(userAgent?: string): DeviceType {
  if (!userAgent) return 'UNKNOWN';
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad/.test(ua)) return 'TABLET';
  if (/mobile|android|iphone/.test(ua)) return 'MOBILE';
  if (/mozilla|chrome|safari|firefox|edge/.test(ua)) return 'DESKTOP';
  return 'UNKNOWN';
}

export function detectBrowser(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome/')) return 'Chrome';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari';
  return undefined;
}

export function detectOs(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os')) return 'macOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('linux')) return 'Linux';
  return undefined;
}
