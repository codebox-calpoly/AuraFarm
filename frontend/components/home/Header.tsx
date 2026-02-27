import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import AuraFarmHeader from "@/assets/AuraFarmHeader.svg";

export function Header() {
  return (
    <ThemedView style={styles.container} lightColor="transparent">
      <AuraFarmHeader width={153} height={27} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: "transparent",
    marginTop: 8,
  },
  logo: {
    width: 200,
    height: 50,
  },
});
