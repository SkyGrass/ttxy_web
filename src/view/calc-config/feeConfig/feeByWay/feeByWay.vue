<template>
  <div>
    <Table border :columns="columns" :data="dataSourceLocal"></Table>
    <i-button
      type="primary"
      style="margin-top:10px"
      @click="initConfig"
      v-if="dataSourceLocal.length<=0 && currentHosIdLocal>0"
    >开始配置</i-button>
  </div>
</template>
<script>
import { getCareWayTableList } from "@/api/base/careway";
export default {
  name: `feebyWay`,
  data() {
    return {
      columns: [
        {
          title: "护理方式",
          key: "itemName",
          align: "center"
        },
        {
          title: "系统参数",
          key: "sysParName_1",
          align: "center"
        },
        {
          title: "连接符",
          key: "linkSymbol_1",
          align: "center"
        },
        {
          title: "系统参数",
          key: "sysParName_2",
          align: "center"
        },
        {
          title: "连接符",
          key: "linkSymbol_2",
          align: "center"
        },
        {
          title: "系数",
          key: "ratio_1",
          align: "center",
          render: (h, params) => {
            const {
              row,
              column: { key },
              index
            } = params;
            return h("div", [
              h(
                "InputNumber",
                {
                  props: {
                    step: 0.1,
                    value: this.dataSourceLocal[index][key]
                  },
                  style: {
                    width: "80%"
                  },
                  on: {
                    "on-change": e => {
                      this.dataSourceLocal[index][key] = e;
                    }
                  }
                },
                " "
              )
            ]);
          }
        }
      ],
      item: {
        itemId: 0,
        itemName: ``,
        sysParName_1: `实际收入`,
        linkSymbol_1: `*`,
        sysParName_2: `护理天数`,
        linkSymbol_2: `*`,
        ratio_1: 0
      },
      dataSourceLocal: this.dataSource,
      currentHosIdLocal: this.currentHosId
    };
  },
  watch: {
    dataSource(newVal, oldVal) {
      this.dataSourceLocal = newVal;
    },
    currentHosId(newVal, oldVal) {
      this.currentHosIdLocal = newVal;
    }
  },
  props: {
    dataSource: {
      type: Array,
      default() {
        return [];
      }
    },
    currentHosId: { type: String, default: "-1" }
  },
  methods: {
    getTableSource() {
      return this.dataSourceLocal;
    },
    initConfig() {
      getCareWayTableList()
        .then(res => {
          this.dataSourceLocal = res.data.map(m => {
            return Object.assign({}, this.item, {
              itemId: m.id,
              itemName: m.name
            });
          });
        })
        .catch(err => {});
    }
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
</style>