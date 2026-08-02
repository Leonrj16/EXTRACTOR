import { describe, expect, it } from "vitest";
import type { LinkItem } from "@/types/link";
import type { ProfileData } from "@/types/profile";
import { validateForPublish } from "./publish-validation";

function makeProfile(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    username: "me",
    displayName: "Mi Perfil",
    bio: null,
    avatarUrl: "https://cdn.test/avatar.png",
    coverUrl: null,
    whatsapp: null,
    contactEmail: null,
    location: null,
    locationUrl: null,
    seoTitle: "Mi Perfil",
    seoDescription: "Una descripción",
    isPublished: false,
    isPasswordProtected: false,
    customDomain: null,
    customDomainToken: null,
    customDomainVerifiedAt: null,
    ...overrides,
  };
}

function makeLink(overrides: Partial<LinkItem> = {}): LinkItem {
  return {
    id: "link-1",
    type: "LINK",
    title: "Mi enlace",
    url: "https://example.com",
    icon: null,
    imageUrl: null,
    metadata: null,
    styleOverrides: null,
    isActive: true,
    order: 10,
    ...overrides,
  };
}

describe("validateForPublish", () => {
  it("returns no issues for a fully filled-out profile with one valid block", () => {
    const issues = validateForPublish(makeProfile(), [makeLink()]);
    expect(issues).toEqual([]);
  });

  it("errors when the display name is empty", () => {
    const issues = validateForPublish(makeProfile({ displayName: "   " }), [makeLink()]);
    expect(issues).toContainEqual(
      expect.objectContaining({ severity: "error", message: expect.stringContaining("nombre a mostrar") }),
    );
  });

  it("warns (not errors) when avatar/SEO fields are missing", () => {
    const issues = validateForPublish(
      makeProfile({ avatarUrl: null, seoTitle: null, seoDescription: null }),
      [makeLink()],
    );
    expect(issues.every((i) => i.severity === "warning")).toBe(true);
    expect(issues).toHaveLength(3);
  });

  it("errors when there are zero active blocks", () => {
    const issues = validateForPublish(makeProfile(), [makeLink({ isActive: false })]);
    expect(issues).toContainEqual(
      expect.objectContaining({ severity: "error", message: expect.stringContaining("ningún bloque activo") }),
    );
  });

  it("ignores inactive blocks when checking for per-block issues", () => {
    // An inactive block with no title would normally error, but since it's
    // not active it shouldn't surface — only the "no active blocks" error should.
    const issues = validateForPublish(makeProfile(), [makeLink({ isActive: false, title: "" })]);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("ningún bloque activo");
  });

  it("errors when an active block has no title", () => {
    const issues = validateForPublish(makeProfile(), [makeLink({ title: "" })]);
    expect(issues).toContainEqual(
      expect.objectContaining({ severity: "error", linkId: "link-1" }),
    );
  });

  it("warns when a URL-oriented block type has no url", () => {
    const issues = validateForPublish(makeProfile(), [makeLink({ type: "SOCIAL", url: null })]);
    expect(issues).toContainEqual(
      expect.objectContaining({ severity: "warning", message: expect.stringContaining("no tiene un enlace") }),
    );
  });

  it("does not warn about a missing url for a non-URL-oriented block type", () => {
    const issues = validateForPublish(makeProfile(), [makeLink({ type: "TEXT", url: null })]);
    expect(issues).toEqual([]);
  });

  it("warns when a HERO block has no cover image", () => {
    const issues = validateForPublish(makeProfile(), [makeLink({ type: "HERO", url: null, imageUrl: null })]);
    expect(issues).toContainEqual(expect.objectContaining({ message: expect.stringContaining("Hero") }));
  });

  it("warns when a PRODUCT block has no photo", () => {
    const issues = validateForPublish(makeProfile(), [makeLink({ type: "PRODUCT", imageUrl: null })]);
    expect(issues).toContainEqual(expect.objectContaining({ message: expect.stringContaining("no tiene foto") }));
  });

  it("warns when a GALLERY block has no images in its metadata", () => {
    const issues = validateForPublish(makeProfile(), [makeLink({ type: "GALLERY", url: null, metadata: { images: [] } })]);
    expect(issues).toContainEqual(expect.objectContaining({ message: expect.stringContaining("no tiene imágenes") }));
  });

  it("does not warn about a GALLERY block that already has images", () => {
    const issues = validateForPublish(makeProfile(), [
      makeLink({ type: "GALLERY", url: null, metadata: { images: ["https://cdn.test/1.png"] } }),
    ]);
    expect(issues).toEqual([]);
  });

  it("uses the link type label instead of an empty title in per-block messages", () => {
    const issues = validateForPublish(makeProfile(), [makeLink({ title: "" })]);
    const titleIssue = issues.find((i) => i.linkId === "link-1" && i.severity === "error");
    expect(titleIssue?.message).toContain("Enlace");
  });
});
