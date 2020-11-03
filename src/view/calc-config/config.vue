<template>
  <div class="split-root">
    <Split v-model="split" mode="vertical">
      <div slot="top" class="split-pane">
        <Split v-model="split1">
          <div slot="left" class="split-pane pane-area">
            <h3>
              <strong>选择医院</strong>
            </h3>
            <Select placeholder="请选择配置医院" @on-change="changeConfig">
              <Option
                v-for="item in hospitalSources"
                :value="item.value"
                :key="item.value"
              >{{item.text}}</Option>
            </Select>

            <i-button
              type="primary"
              style="margin-top:10px"
              @click="SaveConfig"
              v-if="currentHosId>0"
            >保存配置</i-button>
          </div>
          <div slot="right" class="split-pane pane-area">
            <h3>
              <strong>医院管理费配置</strong>
            </h3>
            <Table border :columns="columns" :data="managerFee"></Table>
            <i-button
              type="primary"
              style="margin-top:10px"
              @click="initConfig"
              v-if="managerFee.length<=0 && currentHosId>0"
            >开始配置</i-button>
          </div>
        </Split>
      </div>
      <div slot="bottom" class="split-pane pane-area">
        <Layout class="area_worker">
          <h3>
            <strong>护工工资配置</strong>
            <br />
            <strong style="color:red">注意:以下三种配置互斥，三选一!</strong>
          </h3>
          <Header>
            <div>
              <RadioGroup v-model="feeWay">
                <Radio label="0">
                  <span>按护理种类</span>
                </Radio>
                <Radio label="1">
                  <span>按护理单价</span>
                </Radio>
                <Radio label="2">
                  <span>按护理方式</span>
                </Radio>
              </RadioGroup>
            </div>
          </Header>
          <Content>
            <feeByProject
              v-show="feeWay=='0'"
              ref="feeByProject"
              :currentHosId="currentHosId"
              :dataSource="dataSourceProject"
            />
            <feeByPrice
              v-show="feeWay=='1'"
              ref="feeByPrice"
              :currentHosId="currentHosId"
              :dataSource="dataSourcePrice"
            />
            <feeByWay
              v-show="feeWay=='2'"
              ref="feeByWay"
              :currentHosId="currentHosId"
              :dataSource="dataSourceWay"
            />
          </Content>
        </Layout>
      </div>
    </Split>
  </div>
</template>
<script>
import { getCareProjectTableList } from "@/api/base/careproject";
import { getHospitalSelect } from "@/api/base/hospital";
import { getSysParSelect } from "@/api/base/syspar";
import { loadFeeConfig, saveForm } from "@/api/sys/feeconfig";
import feeByProject from "./feeConfig/feeByProject/feeByProject";
import feeByPrice from "./feeConfig/feeByPrice/feeByPrice";
import feeByWay from "./feeConfig/feeByWay/feeByWay";
export default {
  name: `calc_config_page`,
  data() {
    return {
      split: 0.2,
      split1: 0.2,
      feeWay: "0",
      currentHosId: "0",
      hospitalSources: [],
      sysParSource: [],
      formManageFee: {
        ItemId: 1,
        ItemName: "",
        LinkSymbol_1: "*",
        Ratio: 0,
      },
      columns: [
        {
          title: "系统参数",
          key: "itemId",
          align: "center",
          render: (h, params) => {
            const {
              row,
              column: { key },
              index,
            } = params;
            return h("div", [
              h(
                "Select",
                {
                  props: {
                    transfer: true,
                    value: row[key],
                  },
                  style: {
                    width: "80%",
                  },
                  on: {
                    "on-change": (e) => {
                      this.managerFee[index][key] = e;
                    },
                  },
                },
                this.sysParSource.map((item) => {
                  return h("Option", {
                    props: {
                      value: item.value,
                      label: item.text,
                    },
                  });
                })
              ),
            ]);
          },
        },
        {
          title: "连接符",
          key: "linkSymbol_1",
          align: "center",
        },
        {
          title: "系数1",
          key: "ratio_1",
          align: "center",
          render: (h, params) => {
            const {
              row,
              column: { key },
              index,
            } = params;
            return h("div", [
              h(
                "InputNumber",
                {
                  props: {
                    step: 0.1,
                    value: this.managerFee[index][key],
                  },
                  style: {
                    width: "80%",
                  },
                  on: {
                    "on-change": (e) => {
                      this.managerFee[index][key] = e;
                    },
                  },
                },
                " "
              ),
            ]);
          },
        },
      ],
      config: {},
      managerFee: [],
      dataSourceProject: [],
      dataSourcePrice: [],
      dataSourceWay: [],
      item: { mainId: -1, itemId: 0, linkSymbol_1: "*", ratio_1: 0 },
    };
  },
  components: {
    feeByPrice,
    feeByProject,
    feeByWay,
  },
  methods: {
    initConfig() {
      this.managerFee.push(Object.assign({}, this.item));
    },
    changeConfig(e) {
      this.currentHosId = e + "";
      loadFeeConfig({ id: e }).then((res) => {
        const {
          config,
          managerFee,
          workerFeeByCarePrice,
          workerFeeByCareProject,
          workerFeeByCareWay,
        } = res.data.data;
        if (managerFee) {
          this.managerFee = managerFee;
        }
        this.config = config || { id: -1 };
        this.dataSourceProject =
          workerFeeByCareProject == null ? [] : workerFeeByCareProject;
        this.dataSourcePrice =
          workerFeeByCarePrice == null ? [] : workerFeeByCarePrice;
        this.dataSourceWay =
          workerFeeByCareWay == null ? [] : workerFeeByCareWay;
        if (this.dataSourceProject.length > 0) {
          this.feeWay = "0";
        }
        if (this.dataSourcePrice.length > 0) {
          this.feeWay = "1";
        }
        if (this.dataSourceWay.length > 0) {
          this.feeWay = "2";
        }
      });
    },
    formatSysPar(val) {
      var temp = this.sysParSource.find((f) => f.value == val);
      return temp && temp.text;
    },
    SaveConfig() {
      this.$Modal.confirm({
        title: "操作提示",
        content: `<p>请确认<strong style='color:red'>医院管理费配置</strong>和<strong style='color:red'>护工工资配置</strong></p>`,
        loading: true,
        onOk: () => {
          var feeByProjectDataSource = this.$refs.feeByProject.getTableSource();
          var feeByPriceDataSource = this.$refs.feeByPrice.getTableSource();
          var feeByWayDataSource = this.$refs.feeByWay.getTableSource();
          saveForm({
            configId: this.config.id || -1,
            hosId: this.currentHosId,
            managerFee: JSON.parse(
              JSON.stringify(Object.assign([], this.managerFee))
            ),
            workerFee: {
              feeByProjectDataSource:
                this.feeWay == "0"
                  ? JSON.parse(
                      JSON.stringify(Object.assign([], feeByProjectDataSource))
                    )
                  : [],
              feeByPriceDataSource:
                this.feeWay == "1"
                  ? JSON.parse(
                      JSON.stringify(Object.assign([], feeByPriceDataSource))
                    )
                  : [],
              feeByWayDataSource:
                this.feeWay == "2"
                  ? JSON.parse(
                      JSON.stringify(Object.assign([], feeByWayDataSource))
                    )
                  : [],
            },
          })
            .then((res) => {
              let { data, message } = res.data;
              this.$Modal.remove();
              let arr = [];
              let _id = -1;
              if (data.indexOf("|") > -1) {
                arr = data.split("|");
                data = arr[0];
                _id = arr[1];
                this.config.id = _id;
              }
              if (data == "success") {
                this.$Notice.success({
                  title: "提示",
                  desc: "保存配置成功!",
                });
              } else {
                this.$Notice.error({
                  title: "警告",
                  desc: message != "" ? message : "未能保存医院配置!",
                });
              }
            })
            .catch((err) => console.log(err));
        },
      });
    },
  },
  mounted() {
    getSysParSelect()
      .then((res) => {
        const { state, data } = res.data;
        if (state == "success") {
          this.sysParSource = data;
        }
      })
      .catch((err) => {});
    getHospitalSelect()
      .then((res) => {
        const { state, data } = res.data;
        if (state == "success") {
          this.hospitalSources = data;
        }
      })
      .catch((err) => {});
  },
};
</script>
<style lang="less" scoped>
.split-root {
  height: 100%;
  border: 1px solid #dcdee2;
}
.split-pane {
  height: 30%;
}
.pane-area {
  padding: 10px;
}
.area_worker {
  .ivu-layout-header {
    background-color: transparent;
    color: #333 !important;
    border-bottom: 1px solid lightgray;
  }
}
</style>