import React, { createContext, useState, useContext } from "react";
import { View, Text } from "react-native";
import { Snackbar } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState("");

  const show = (icon = '', msg) => {
    setIcon(icons[icon]);
    setMessage(msg);
    setVisible(true);
  };

  const icons = {
    "": "",
    success: "check-circle",
    error: "exclamation-triangle",
  }

  const hide = () => setVisible(false);

  return (
    <SnackbarContext.Provider value={{ show, hide }}>
      {children}
      <View>
        <Snackbar
          visible={visible}
          onDismiss={hide}
          duration={3000}
          wrapperStyle={{ alignItems: "center" }}
          style={{
            borderRadius: 8,
            color: "#000",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {
              icon && (
                <FontAwesome
                  name={icon}
                  size={25}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
              )
            }
            <Text style={{ color: "#fff", fontSize: 16 }}>{message}</Text>
          </View>
        </Snackbar>
      </View>
    </SnackbarContext.Provider>
  );
};
