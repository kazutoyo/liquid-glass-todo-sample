import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
  VectorIcon
} from "expo-router/unstable-native-tabs";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <Label>ホーム</Label>
        {Platform.select({
          android: (
            <Icon src={<VectorIcon family={FontAwesome} name="home" />} />
          ),
          default: <Icon sf="house.fill" />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="todos">
        <Label>TODO一覧</Label>
        {Platform.select({
          android: (
            <Icon src={<VectorIcon family={FontAwesome} name="list" />} />
          ),
          default: <Icon sf="list.bullet" />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <Label>検索</Label>
        {Platform.select({
          android: (
            <Icon src={<VectorIcon family={FontAwesome} name="search" />} />
          ),
          default: <Icon sf="magnifyingglass" />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>設定</Label>
        {Platform.select({
          android: (
            <Icon src={<VectorIcon family={FontAwesome} name="cog" />} />
          ),
          default: <Icon sf="gear" />,
        })}
        <Badge>9+</Badge>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
