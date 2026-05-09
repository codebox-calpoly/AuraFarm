import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { layout, radius, spacing } from "@/constants/design";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";

const APPLE_EULA_URL =
  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
const SUPPORT_EMAIL = "aurafarmapp@gmail.com";

export default function TermsScreen() {
  const router = useRouter();

  const openAppleEula = () => {
    Linking.openURL(APPLE_EULA_URL).catch(() => {});
  };

  const openSupportEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityLabel="Back"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={tailwindColors["aura-black"]}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Use</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: May 9, 2026</Text>

        <Section title="Acceptance of Terms">
          <Paragraph>
            Welcome to Aura Farm. By creating an account, signing in, or
            otherwise using the Aura Farm mobile application or any related
            services (collectively, the &quot;Service&quot;), you agree to be
            bound by these Terms of Use (&quot;Terms&quot;) and our Privacy
            policies. If you do not agree, do not use the Service.
          </Paragraph>
          <Paragraph>
            These Terms form a binding legal agreement between you and Aura Farm
            (&quot;Aura Farm,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;). We may change them from time to time as described
            in &quot;Changes to Terms&quot; below.
          </Paragraph>
        </Section>

        <Section title="Eligibility">
          <Paragraph>
            Aura Farm is built for the Cal Poly San Luis Obispo community. To
            create an account you must:
          </Paragraph>
          <Bullet>
            Be a current Cal Poly student with a valid <Mono>@calpoly.edu</Mono>{" "}
            email address (required for sign-up).
          </Bullet>
          <Bullet>
            Be at least 13 years of age, in compliance with the U.S. Children&apos;s
            Online Privacy Protection Act (COPPA). Users under 18 represent that
            they have permission from a parent or legal guardian to use the
            Service.
          </Bullet>
          <Bullet>
            Provide accurate registration information and keep it up to date.
          </Bullet>
          <Paragraph>
            We may suspend or terminate accounts that do not meet these
            eligibility requirements at any time and without notice.
          </Paragraph>
        </Section>

        <Section title="User Conduct">
          <Paragraph>
            Aura Farm has{" "}
            <Text style={styles.strong}>
              zero tolerance for objectionable content or abusive users.
            </Text>{" "}
            We commit to acting on every flag and block within{" "}
            <Text style={styles.strong}>24 hours</Text> by removing offending
            content, banning offenders where appropriate, and following up with
            you when needed. The following behavior is strictly prohibited:
          </Paragraph>
          <Bullet>
            Harassment, bullying, stalking, threats, or intimidation of any
            person.
          </Bullet>
          <Bullet>
            Hate speech or discriminatory content targeting people based on
            race, ethnicity, national origin, religion, gender, gender identity,
            sexual orientation, disability, or other protected status.
          </Bullet>
          <Bullet>
            Sexually explicit, pornographic, or otherwise sexually suggestive
            content; nudity; or sexualization of minors.
          </Bullet>
          <Bullet>
            Doxxing, sharing personal information, or revealing the identity of
            others without their consent.
          </Bullet>
          <Bullet>
            Impersonating any person, organization, university department, or
            student group.
          </Bullet>
          <Bullet>
            Spam, scams, deceptive promotions, or commercial solicitation.
          </Bullet>
          <Bullet>
            Encouraging, depicting, or coordinating illegal activity, violence,
            self-harm, or substance abuse.
          </Bullet>
          <Bullet>
            Posting copyrighted material you do not own or otherwise have
            permission to share.
          </Bullet>
          <Bullet>
            Attempting to bypass Aura Farm&apos;s safety controls, location
            checks, or moderation systems.
          </Bullet>
          <Paragraph>
            Violations may result in immediate content removal, account
            suspension, or permanent ban without prior notice.
          </Paragraph>
        </Section>

        <Section title="User-Generated Content">
          <Paragraph>
            You retain ownership of the photos, captions, and other content you
            post (&quot;User Content&quot;). By posting User Content to the
            Service, you grant Aura Farm a worldwide, non-exclusive,
            royalty-free, sublicensable license to host, store, reproduce,
            display, and distribute your User Content solely for the purpose of
            operating, improving, and promoting the Service.
          </Paragraph>
          <Paragraph>
            You are solely responsible for the User Content you post and the
            consequences of posting it. You represent that you have all
            necessary rights to your User Content, that it complies with these
            Terms, and that it does not violate the rights of any third party.
          </Paragraph>
          <Paragraph>
            Aura Farm may, at its sole discretion and without notice, remove,
            hide, or disable any content that we believe violates these Terms or
            is otherwise harmful to users or the Service.
          </Paragraph>
        </Section>

        <Section title="Reporting and Blocking">
          <Paragraph>
            Aura Farm provides in-app tools so you can take immediate action
            when you encounter content or behavior you believe violates these
            Terms:
          </Paragraph>
          <Bullet>
            <Text style={styles.strong}>Flag a post</Text> using the flag icon
            on any post in the feed. You can include an optional description.
          </Bullet>
          <Bullet>
            <Text style={styles.strong}>Block a user</Text> from the same menu
            to immediately stop seeing their posts. The block is mutual: blocked
            users will no longer see your posts either, and any existing friend
            connection is severed.
          </Bullet>
          <Paragraph>
            Every flag and block generates a notification to our moderation
            inbox. The Aura Farm team reviews each report, removes content that
            violates these Terms, and bans repeat offenders. We commit to
            taking action within 24 hours of a report.
          </Paragraph>
        </Section>

        <Section title="Account Termination">
          <Paragraph>
            You may delete your account at any time from Settings. When you
            delete your account, your profile, completions, photos, likes, and
            friend connections are permanently removed.
          </Paragraph>
          <Paragraph>
            Aura Farm may suspend, restrict, or terminate your account — with or
            without notice — if we believe you have violated these Terms,
            misused the Service, or engaged in conduct that harms other users.
            We may also discontinue the Service or any feature at any time.
          </Paragraph>
        </Section>

        <Section title="Disclaimers and Limitation of Liability">
          <Paragraph>
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
            NON-INFRINGEMENT. AURA FARM DOES NOT WARRANT THAT THE SERVICE WILL
            BE UNINTERRUPTED, SECURE, ERROR-FREE, OR THAT USER CONTENT POSTED BY
            OTHERS WILL BE ACCURATE OR APPROPRIATE.
          </Paragraph>
          <Paragraph>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AURA FARM AND
            ITS AFFILIATES, OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING
            FROM YOUR USE OF THE SERVICE.
          </Paragraph>
        </Section>

        <Section title="Changes to Terms">
          <Paragraph>
            We may update these Terms from time to time to reflect changes in
            the Service, our practices, or applicable law. When we do, we will
            update the &quot;Last updated&quot; date at the top of this screen
            and, where appropriate, notify you in the app. Your continued use of
            the Service after the changes take effect constitutes your
            acceptance of the updated Terms.
          </Paragraph>
        </Section>

        <Section title="Contact">
          <Paragraph>
            For questions, account appeals, or moderation requests, please
            contact us at{" "}
            <Text style={styles.link} onPress={openSupportEmail}>
              {SUPPORT_EMAIL}
            </Text>
            .
          </Paragraph>
        </Section>

        <View style={styles.appleNotice}>
          <Text style={styles.appleNoticeTitle}>Apple Standard EULA</Text>
          <Text style={styles.appleNoticeBody}>
            Aura Farm uses Apple&apos;s standard EULA for licensed application
            end users. The full text is available at{" "}
            <Text style={styles.link} onPress={openAppleEula}>
              {APPLE_EULA_URL}
            </Text>
            .
          </Text>
        </View>

        <Text style={styles.footerCopy}>© Aura Farm · Cal Poly SLO</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <Text style={styles.mono}>{children}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tailwindColors["aura-page"],
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tailwindColors["aura-border"],
    backgroundColor: tailwindColors["aura-page"],
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 17,
    color: tailwindColors["aura-black"],
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  lastUpdated: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 12,
    color: tailwindColors["aura-gray-500"],
    marginBottom: spacing.lg,
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: tailwindFonts["bold"],
    fontSize: 18,
    color: tailwindColors["aura-black"],
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  paragraph: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 15,
    lineHeight: 22,
    color: tailwindColors["aura-gray-700"],
    marginBottom: spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  bulletDot: {
    fontFamily: tailwindFonts["bold"],
    fontSize: 16,
    lineHeight: 22,
    color: tailwindColors["aura-green"],
  },
  bulletText: {
    flex: 1,
    fontFamily: tailwindFonts["regular"],
    fontSize: 15,
    lineHeight: 22,
    color: tailwindColors["aura-gray-700"],
  },
  strong: {
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-black"],
  },
  mono: {
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-black"],
  },
  link: {
    color: tailwindColors["aura-green"],
    textDecorationLine: "underline",
  },
  appleNotice: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: tailwindColors["aura-surface"],
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tailwindColors["aura-border"],
  },
  appleNoticeTitle: {
    fontFamily: tailwindFonts["semibold"],
    fontSize: 14,
    color: tailwindColors["aura-black"],
    marginBottom: spacing.xs,
  },
  appleNoticeBody: {
    fontFamily: tailwindFonts["regular"],
    fontSize: 13,
    lineHeight: 20,
    color: tailwindColors["aura-gray-600"],
  },
  footerCopy: {
    marginTop: spacing.lg,
    textAlign: "center",
    fontFamily: tailwindFonts["regular"],
    fontSize: 12,
    color: tailwindColors["aura-gray-400"],
  },
});
