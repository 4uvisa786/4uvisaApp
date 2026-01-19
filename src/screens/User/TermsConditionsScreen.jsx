import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../themes/color';

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.updated}>Last Updated: 10/01/2026</Text>

        <Text style={styles.text}>
          By downloading, installing, or using this mobile application (“App”),
          you agree to these Terms & Conditions. If you do not agree, please do
          not use the App.
        </Text>

        {/* 1 */}
        <Text style={styles.heading}>1. Services Provided</Text>
        <Text style={styles.text}>
          This App provides customer support and assistance services related to:
        </Text>
        <Text style={styles.bullet}>• Work Visa assistance</Text>
        <Text style={styles.bullet}>• Visit Visa assistance</Text>
        <Text style={styles.bullet}>• Apostille verification support</Text>
        <Text style={styles.bullet}>• Embassy appointment booking assistance</Text>
        <Text style={styles.bullet}>• Embassy attestation support</Text>
        <Text style={styles.bullet}>• Medical token & NAVTTC guidance</Text>
        <Text style={styles.bullet}>• MOFA attestation support</Text>
        <Text style={styles.text}>
          All services are provided only as assistance and facilitation, not as
          official government processing.
        </Text>

        {/* 2 */}
        <Text style={styles.heading}>2. No Government or Embassy Affiliation</Text>
        <Text style={styles.text}>
          This App is not affiliated, associated, authorized, endorsed by, or
          officially connected with any government authority, embassy,
          consulate, immigration department, or visa office.
        </Text>
        <Text style={styles.text}>
          All final decisions regarding visas, attestations, or approvals are
          taken solely by the respective authorities.
        </Text>

        {/* 3 */}
        <Text style={styles.heading}>3. User Responsibilities</Text>
        <Text style={styles.bullet}>
          • All documents, photos, passport details, and personal information
          provided are true and correct
        </Text>
        <Text style={styles.bullet}>
          • Incorrect or fake documents may lead to rejection
        </Text>
        <Text style={styles.bullet}>
          • Submission of documents does not guarantee approval
        </Text>
        <Text style={styles.bullet}>
          • We are not responsible for delays or rejections caused by incorrect
          user information
        </Text>

        {/* 4 */}
        <Text style={styles.heading}>4. Document Upload & File Access</Text>
        <Text style={styles.text}>
          The App allows users to upload documents such as passport copies,
          photographs, and visa or attestation-related documents.
        </Text>
        <Text style={styles.text}>
          File access is used only to collect documents required for requested
          services. We do not access files without user permission.
        </Text>

        {/* 5 */}
        <Text style={styles.heading}>5. Data Usage & Privacy</Text>
        <Text style={styles.bullet}>• Data is collected strictly for service processing</Text>
        <Text style={styles.bullet}>• Documents are shared only with authorized staff</Text>
        <Text style={styles.bullet}>• Personal data is not sold or misused</Text>
        <Text style={styles.bullet}>
          • Data may be shared if legally required by authorities
        </Text>

        {/* 6 */}
        <Text style={styles.heading}>6. Fees & Payments</Text>
        <Text style={styles.bullet}>• Fees charged are service fees only</Text>
        <Text style={styles.bullet}>
          • Government or embassy fees are not included unless mentioned
        </Text>
        <Text style={styles.bullet}>
          • Payments are non-refundable once processing starts
        </Text>

        {/* 7 */}
        <Text style={styles.heading}>7. No Guarantee Disclaimer</Text>
        <Text style={styles.bullet}>• Visa approval</Text>
        <Text style={styles.bullet}>• Processing time</Text>
        <Text style={styles.bullet}>• Appointment confirmation</Text>
        <Text style={styles.bullet}>• Attestation outcome</Text>

        {/* 8 */}
        <Text style={styles.heading}>8. Limitation of Liability</Text>
        <Text style={styles.text}>
          We are not liable for visa rejections, delays, rule changes, incorrect
          user information, or technical issues beyond our control. Use of this
          App is at your own risk.
        </Text>

        {/* 9 */}
        <Text style={styles.heading}>9. Account Suspension</Text>
        <Text style={styles.text}>
          We reserve the right to suspend or terminate access if fraudulent
          documents are uploaded, the App is misused, or these terms are
          violated.
        </Text>

        {/* 10 */}
        <Text style={styles.heading}>10. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these Terms & Conditions at any time. Continued use of
          the App means acceptance of the updated terms.
        </Text>

        {/* 11 */}
        <Text style={styles.heading}>11. Contact Information</Text>
        <TouchableOpacity
  onPress={() => Linking.openURL('mailto:4uvisaconsultant@gmail.com')}
>
  <Text style={[styles.text, styles.link]}>
    📧 Email: 4uvisaconsultant@gmail.com
  </Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() => Linking.openURL('tel:+923146141166')}
>
  <Text style={[styles.text, styles.link]}>
    📞 Phone: +92 314 614 1166
  </Text>
</TouchableOpacity>


        <Text style={styles.footer}>© 2026 All Rights Reserved</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  updated: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 6,
    color: Colors.textPrimary,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  footer: {
    marginTop: 30,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
