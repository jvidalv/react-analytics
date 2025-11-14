import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  Link,
} from "@react-email/components";
import * as React from "react";
import { tailwindEmailConfig } from "@/components/emails/tailwind-config";

const baseUrl = process.env.VERCEL_URL
  ? `https://expofast.app`
  : "http://localhost:3000";

export const WaitlistJoinEmail = () => (
  <Tailwind config={tailwindEmailConfig}>
    <Html>
      <Head />
      <Preview>We’re thrilled to have you on the ExpoFast waitlist! 🎉</Preview>
      <Body style={main}>
        <Container className="rounded-lg" style={container}>
          <Section style={box}>
            <Img
              src={`${baseUrl}/assets/images/logo-emails.png`}
              height="50"
              alt="ExpoFast"
            />
            <Text style={paragraph}>
              Hey! I’m thrilled to have you on the waitlist! 🎉
            </Text>
            <Text style={paragraph}>
              ✅ I’ll notify you when your invite is ready. <br /> 🔥 Early
              access means exclusive features & a head start before everyone
              else. <br />
              💬 Have questions? Reply to this email—we’d love to hear from you!
            </Text>
            <Text style={paragraph}></Text>
            <Text style={paragraph}></Text>
            <Text style={paragraph} className="opacity-50">
              — Josep from Expofast
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              <Link href="https://expofast.app">ExpoFast © 2025</Link>, Vilalba
              dels Arcs, TA 43782
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

export default WaitlistJoinEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "16px",
  marginBottom: "64px",
};

const box = {};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
