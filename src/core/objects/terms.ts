export interface TOSSection {
  id: string;
  title: string;
  content: string[];
}

export interface TOS {
  appName: string;
  effectiveDate: string;
  sections: TOSSection[];
}

export const TermsOfService: TOS = {
  appName: "The Ai.Mi App",
  effectiveDate: "March 20, 2026",
  sections: [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: [
        'By downloading, installing, or using the Ai.Mi App ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please uninstall the App.',
        "These Terms apply to all users of the App, regardless of how it was obtained.",
      ],
    },
    {
      id: "about",
      title: "About the App",
      content: [
        'The Ai.Mi App is a free, open-source companion application for the game "Omega Strikers". It is developed and maintained by the ClarionCorp team and is not affiliated with, endorsed by, or officially connected to Omega Strikers or Odyssey Interactive.',
        "The App's source code is publicly available under the GNU Affero General Public License v3.0 (AGPL-3.0). You may view, modify, and distribute the source code in accordance with the terms of that license.",
      ],
    },
    {
      id: "no-warranty",
      title: "No Warranty",
      content: [
        'THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE CLARIONCORP TEAM DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:',
        "Merchantability or fitness for a particular purpose.",
        "Accuracy, completeness, or reliability of any data or information provided by the App.",
        "Uninterrupted, error-free, or secure operation.",
        "Compatibility with any version of Omega Strikers or any other software.",
        "Your use of the App is entirely at your own risk.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      content: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE CLARIONCORP TEAM, ITS CONTRIBUTORS, OR ANYONE ASSOCIATED WITH THE DEVELOPMENT OF THE APP BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING BUT NOT LIMITED TO:",
        "Loss of data, profits, or goodwill.",
        "Account suspensions, bans, or penalties imposed by Omega Strikers, Odyssey Interactive, or any third party.",
        "Damages resulting from your use of, or inability to use, the App.",
        "This limitation applies regardless of the theory of liability and even if the ClarionCorp team has been advised of the possibility of such damages.",
      ],
    },
    {
      id: "user-responsibilities",
      title: "User Responsibilities",
      content: [
        "You are solely responsible for how you use the App. By using the App, you agree that you will not:",
        "Use the App in any way that violates the terms of service or rules of Omega Strikers or Odyssey Interactive.",
        "Reverse engineer, modify, or redistribute the App in violation of the AGPL-3.0 license.",
        "Use the App for any unlawful purpose.",
        "The ClarionCorp team makes no guarantees regarding the compatibility of the App with Omega Strikers' terms of service. It is your responsibility to ensure your use complies with all applicable rules.",
      ],
    },
    {
      id: "external-services",
      title: "External Services and APIs",
      content: [
        "The App connects to the following external services depending on your settings:",
        "Prometheus Proxy (Odyssey Interactive): The App always connects to the Prometheus Proxy to retrieve game data such as player statistics and match history. This connection is subject to Odyssey Interactive's own terms of service and privacy policy.",
        "ClarionCorp API: The App connects to the ClarionCorp API only when one or more telemetry options are enabled (see Section 7). If all telemetry is disabled, no connection to the ClarionCorp API is made.",
        "The ClarionCorp team is not responsible for the availability, accuracy, or reliability of any third-party data or services, including the Prometheus Proxy. Changes to external APIs may cause certain features of the App to stop working.",
      ],
    },
    {
      id: "telemetry",
      title: "Telemetry and Data Collection",
      content: [
        "The App includes three optional, independent telemetry features. All are disabled by default and can be toggled at any time in the setup wizard or the Settings page. Enabling any telemetry option will cause the App to connect to the ClarionCorp API.",
        "Game Stats: Collects your match history and basic account information from the Prometheus Proxy and associates it with your Omega Strikers account in the ClarionCorp API. This is used to provide stats tracking features.",
        "Play Status: Enables Discord Rich Presence and sends your current play status to the ClarionCorp API. This allows others to see your activity via Discord and on the ClarionCorp website.",
        "Play Count: Sends an anonymous increment to the ClarionCorp API's active player counter. No identifying information is transmitted. This is used solely to display a live player count.",
        "No telemetry option collects passwords, authentication tokens, or any information beyond what is described above. Collected data is not sold or shared with third parties for advertising purposes.",
        "You may disable any or all telemetry options at any time through the Settings page without affecting other App functionality.",
      ],
    },
    {
      id: "updates",
      title: "Updates and Changes",
      content: [
        "The ClarionCorp team may release updates to the App at any time. Certain builds support automatic updates from GitHub. You are not required to install updates, but older versions may lose functionality if external APIs or services change.",
        "These Terms may be updated from time to time. Continued use of the App after a revision constitutes your acceptance of the updated Terms. The effective date at the top of this document reflects the most recent revision.",
      ],
    },
    {
      id: "termination",
      title: "Termination",
      content: [
        "You may stop using the App at any time by uninstalling it. The ClarionCorp team reserves the right to discontinue the App or any of its features at any time, with or without notice.",
      ],
    },
    {
      id: "open-source",
      title: "Open Source License",
      content: [
        "The App is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). Nothing in these Terms restricts rights granted to you under that license. In the event of a conflict between these Terms and the AGPL-3.0 license as it pertains to the source code, the AGPL-3.0 license shall prevail.",
        "A copy of the AGPL-3.0 license is included with the App's source code and is available at: https://www.gnu.org/licenses/agpl-3.0.html",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      content: [
        "If you have questions about these Terms or the App, you can reach the ClarionCorp team through the App's official repository or community channels.",
      ],
    },
  ],
};