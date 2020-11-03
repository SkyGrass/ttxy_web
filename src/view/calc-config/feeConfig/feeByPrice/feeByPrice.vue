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
export default {
  name: `feebyPrice`,
  data() {
    return {
      columns: [
        {
          title: "开始单价",
          key: "startPoint",
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
                    step: 1,
                    min: 0,
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
        },
        {
          title: "结束单价",
          key: "endPoint",
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
                    step: 1,
                    min: 0,
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
        },
        {
          title: "对应扣除工资",
          key: "fee",
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
                    step: 1,
                    min: 0,
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
        },
        {
          title: "操作",
          key: "sysParName_2",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "warning",
                    size: "small"
                  },
                  style: {
                    "margin-right": "10px"
                  },
                  on: {
                    click: () => {
                      this.copyToNext(params);
                    }
                  }
                },
                "加一行"
              ),
              h(
                "Button",
                {
                  props: { type: "error", size: "small" },
                  on: {
                    click: () => {
                      this.remove(params);
                    }
                  }
                },
                "移除"
              )
            ]);
          }
        }
      ],
      item: {
        startPoint: 0,
        endPoint: 0,
        fee: 0
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
    remove(param) {
      this.dataSourceLocal.splice(param.index, 1);
    },
    copyToNext(param) {
      this.dataSourceLocal.splice(
        param.index + 1,
        0,
        Object.assign({}, this.item, {
          startPoint: param.row.startPoint,
          endPoint: param.row.endPoint,
          fee: param.row.fee
        })
      );
    },
    getTableSource() {
      return this.dataSourceLocal;
    },
    initConfig() {
      this.dataSourceLocal.push(Object.assign({}, this.item));
    }
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
</style>