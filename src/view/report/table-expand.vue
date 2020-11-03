<style scoped>
.expand-row {
  margin-bottom: 16px;
}
</style>
<template>
  <div>
    <Row class="expand-row">
      <Table
        :border="false"
        size="small"
        :highlight-row="true"
        :data="stores.detail.data"
        :columns="stores.detail.columns"
      ></Table>
    </Row>
  </div>
</template>
<script>
import dayjs from "dayjs";
import { getBillDetail } from "@/api/sys/billrecord";
export default {
  props: {
    id: String,
    careProjects: {
      type: Array,
      default: function() {
        return [];
      }
    },
    careWays: {
      type: Array,
      default: function() {
        return [];
      }
    },
    persons: {
      type: Array,
      default: function() {
        return [];
      }
    },
    payWays: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    var self = this;
    return {
      stores: {
        detail: {
          data: [],
          columns: [
            {
              title: "日期",
              align: "center",
              key: "fDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fDate }
                } = params;
                var text = dayjs(fDate).format("YYYY-MM-DD HH:mm:ss");

                if (fDate != "" && fDate != null) {
                  return h("span", {}, text);
                }
              }
            },
            {
              title: "开始陪护",
              align: "center",
              key: "fBeginDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fBeginDate, fBeginPeriod }
                } = params;
                var text = `${dayjs(fBeginDate).format(
                  "YYYY-MM-DD"
                )}(${fBeginPeriod})`;

                if (fBeginDate != "" && fBeginDate != null) {
                  return h("span", {}, text);
                }
              }
            },
            {
              title: "结束陪护",
              align: "center",
              key: "fEndDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { fEndDate, fEndPeriod }
                } = params;
                var text = `${dayjs(fEndDate).format(
                  "YYYY-MM-DD"
                )}(${fEndPeriod})`;

                if (fEndDate != "" && fEndDate != null) {
                  return h("span", {}, text);
                }
              }
            },
            {
              title: "护工",
              align: "center",
              key: "fPersonID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fPersonID }
                } = params;
                var tmp = self.$props.persons.find(f => f.id == fPersonID);

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              }
            },
            {
              title: "护理种类",
              align: "center",
              key: "fCareTypeID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fCareTypeID }
                } = params;
                var tmp = self.$props.careProjects.find(
                  f => f.id == fCareTypeID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              }
            },
            {
              title: "护理方式",
              align: "center",
              key: "fCareWayID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fCareWayID }
                } = params;
                var tmp = self.$props.careWays.find(f => f.id == fCareWayID);

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              }
            },
            {
              title: "收款类型",
              align: "center",
              key: "fRecType",
              width: 120
            },
            {
              title: "收款方式",
              align: "center",
              key: "fRecWayID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { fRecWayID }
                } = params;
                var tmp = self.$props.payWays.find(f => f.id == fRecWayID);

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              }
            },
            // {
            //   title: "价格",
            //   align: "center",
            //   key: "fPrice",
            //   width: 80
            // },
            {
              title: "结算天数",
              align: "center",
              key: "fDay",
              width: 80
            },
            {
              title: "收款金额",
              align: "center",
              key: "fRecSum",
              width: 80
            }
          ]
        }
      }
    };
  },
  mounted() {
    if (this.$props.id) {
      getBillDetail(this.$props.id).then(res => {
        this.stores.detail.data = res.data.data;
      });
    }
  }
};
</script>