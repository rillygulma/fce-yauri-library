import {
  Document,
  Page,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
});

export const PdfDocument = ({
  topic,
  content,
}: {
  topic: string;
  content: string;
}) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>{topic}</Text>
      <Text style={styles.content}>{content}</Text>
    </Page>
  </Document>
);