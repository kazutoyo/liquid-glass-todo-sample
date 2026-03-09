import FontAwesome from "@expo/vector-icons/FontAwesome";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>ホーム</NativeTabs.Trigger.Label>
        {Platform.select({
          android: (
            <NativeTabs.Trigger.Icon
              src={
                <NativeTabs.Trigger.VectorIcon
                  family={FontAwesome}
                  name="home"
                />
              }
            />
          ),
          default: <NativeTabs.Trigger.Icon sf="house.fill" />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="todos">
        <NativeTabs.Trigger.Label>TODO一覧</NativeTabs.Trigger.Label>
        {Platform.select({
          android: (
            <NativeTabs.Trigger.Icon
              src={
                <NativeTabs.Trigger.VectorIcon
                  family={FontAwesome}
                  name="list"
                />
              }
            />
          ),
          default: <NativeTabs.Trigger.Icon sf="list.bullet" />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>検索</NativeTabs.Trigger.Label>
        {Platform.select({
          android: (
            <NativeTabs.Trigger.Icon
              src={
                <NativeTabs.Trigger.VectorIcon
                  family={FontAwesome}
                  name="search"
                />
              }
            />
          ),
          default: <NativeTabs.Trigger.Icon sf="magnifyingglass" />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>設定</NativeTabs.Trigger.Label>
        {Platform.select({
          android: (
            <NativeTabs.Trigger.Icon
              src={
                <NativeTabs.Trigger.VectorIcon
                  family={FontAwesome}
                  name="cog"
                />
              }
            />
          ),
          default: <NativeTabs.Trigger.Icon sf="gear" />,
        })}
        <NativeTabs.Trigger.Badge>9+</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
