<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <!-- <Badge :dot="!!messageUnreadCount"> -->
      <Badge>
        <!-- <Avatar :src="userAvator" /> -->
        用户：
        <span>{{ this.$store.state.user.userRealName}}</span>
        <!-- |部门：
        <span>{{ this.$store.state.user.userDept}}</span> -->
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import "./user.less";
import { mapActions } from "vuex";
export default {
  name: "User",
  props: {
    userAvator: {
      type: String,
      default: ""
    },
    messageUnreadCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    ...mapActions(["handleLogOut"]),
    logout() {
      var $this = this;
      this.$Modal.confirm({
        title: "退出确认",
        content: "确定要退出系统吗?",
        okText: "确定退出",
        cancelText: "再想想",
        loading: true,
        onOk() {
          setTimeout(function() {
            $this.handleLogOut().then(() => {
              $this.$Modal.remove();
              $this.$router.push({
                name: "login"
              });
            });
          }, 1500);
        }
      });
    },
    message() {
      this.$router.push({
        name: "message_page"
      });
    },
    downLoad() {
      var elemIF = document.createElement("iframe");
      elemIF.src = `/setup/ProcessFileReadSetup.exe`;
      elemIF.style.display = "none";
      document.body.appendChild(elemIF);
    },
    handleClick(name) {
      switch (name) {
        case "logout":
          this.logout();
          break;
        case "download":
          this.downLoad();
          break;
        case "message":
          this.message();
          break;
      }
    }
  }
};
</script>
