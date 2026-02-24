import AuraDiamond from "@/assets/AuraDiamond.svg";
import AuraFarmHeader from "@/assets/AuraFarmHeader.svg";
import Auratext from "@/assets/Auratext.svg";
import ShareButton from "@/assets/ShareButton.svg";
import { SafeAreaView, StyleSheet, View } from "react-native";

export default function AuraScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AuraFarmHeader width={153} height={27} />

        <AuraDiamond width={270} height={426} />

        <Auratext width={194} height={49} />

        <ShareButton width={32} height={37} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e7cfd5",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 28,
    paddingBottom: 46,
  },
});
