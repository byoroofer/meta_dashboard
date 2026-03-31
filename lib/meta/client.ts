import { env, hasMetaConfig } from "@/lib/config/env";

export class MetaBusinessClient {
  constructor(private readonly accessToken = env.META_SYSTEM_USER_ACCESS_TOKEN) {}

  private assertConfigured() {
    if (!hasMetaConfig || !this.accessToken) {
      throw new Error("Meta business API client is not configured.");
    }
  }

  async getConnectedAssets() {
    this.assertConfigured();
    throw new Error("Live Meta asset discovery is intentionally not implemented in scaffold mode.");
  }

  async sendBusinessMessage() {
    this.assertConfigured();
    throw new Error("Live Meta outbound messaging is intentionally not implemented in scaffold mode.");
  }

  async fetchAdInsights() {
    this.assertConfigured();
    throw new Error("Live Meta insights sync is intentionally not implemented in scaffold mode.");
  }
}
