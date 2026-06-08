import { normalizeRole } from "./userRole";

export function serializePublicUser(userData: Record<string, unknown>) {
  const visaExpire = userData.visaExpireDate ?? userData.visa_expire_date;
  return {
    id: userData._id?.toString(),
    email: userData.email,
    name: userData.name,
    role: normalizeRole(String(userData.role || "user")),
    locale: userData.locale,
    avatar: userData.avatar,
    bio: userData.bio,
    location: userData.location,
    phone: userData.phone,
    address: userData.address,
    languages: userData.languages || [],
    nationality: userData.nationality || null,
    university: userData.university || null,
    region: userData.region || null,
    visaType: userData.visaType || null,
    visaExpireDate: visaExpire ? new Date(visaExpire as string | Date).toISOString() : null,
    countryStatus: userData.countryStatus || "unknown",
    onboardingStatus: userData.onboardingStatus || "pending",
    createdAt: userData.createdAt,
  };
}
