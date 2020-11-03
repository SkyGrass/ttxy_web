<template>
  <div>
    <Card>
      <dz-table :showPagination="false">
        <div slot="searcher">
          <section class="dnc-toolbar-wrap">
            <Row :gutter="10">
              <Col span="10">
                <Form inline @submit.native.prevent>
                  <FormItem>
                    <DatePicker
                      search
                      :value="dates"
                      v-model="stores.billbuild.query.dates"
                      type="datetimerange"
                      style="width:200px"
                      format="yyyy-MM-dd"
                      placeholder="请选择日期"
                      clearable
                      @on-ok="handleSearchRecordList()"
                    ></DatePicker>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billbuild.query.fhospitalid"
                      @on-change="handleSearchRecordList"
                      style="width:150px;"
                    >
                      <Option
                        v-for="item in stores.billbuild.sources.hospiatls"
                        :value="item.id"
                        :key="item.id"
                      >{{item.name}}</Option>
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billbuild.query.fisbuild"
                      @on-change="handleSearchRecordList"
                      style="width:80px;"
                    >
                      <Option
                        v-for="item in stores.billbuild.sources.yesorno"
                        :value="item.value"
                        :key="item.value"
                      >{{item.text}}</Option>
                    </Select>
                  </FormItem>
                  <ButtonGroup>
                    <Button
                      size="large"
                      icon="ios-search"
                      :loading="loading"
                      @click="handleSearchRecordList"
                    >查询</Button>
                    <Button
                      size="large"
                      icon="ios-paper-outline"
                      :loading="loading"
                      :disabled="selectRows<=0"
                      @click="markConfirm"
                      v-show="!stores.billbuild.query.fisbuild"
                    >生成凭证</Button>
                  </ButtonGroup>
                </Form>
              </Col>
              <Col :span="3">
                <Button>
                  总金额:
                  <span style="color:red">￥{{recSum}}</span>
                </Button>
              </Col>
              <Col :span="2">
                <Button>
                  总行数:
                  <span style="color:red">{{selectRows}}</span>
                </Button>
              </Col>
            </Row>
          </section>
        </div>
        <Table
          slot="table"
          ref="tables"
          :border="false"
          size="small"
          :span-method="handleSpan"
          :highlight-row="true"
          :data="stores.billbuild.data"
          :columns="stores.billbuild.columns"
          @on-refresh="handleRefresh"
          @on-selection-change="summaryRecord"
          :row-class-name="rowClsRender"
        ></Table>
      </dz-table>
    </Card>
  </div>
</template>

<script>
import DzTable from "_c/tables/dz-table.vue";
import dayjs from "dayjs";
import { getBillBuild, updateBillBuild } from "@/api/sys/billbuild";
import { getHospitalSelect } from "@/api/base/hospital";
import { getAreaSelectAll } from "@/api/base/area";
import { getBedSelectAll } from "@/api/base/bed";
import { getManagerSelectAll } from "@/api/base/manager";
import { getCareProjectSelectAll } from "@/api/base/careproject";
import { getCareWaySelectAll } from "@/api/base/careway";
import { getPayWaySelectAll } from "@/api/base/payway";
import { getPcSelectAll } from "@/api/base/pc";
import * as math from "mathjs";
export default {
  name: "bill_build_page",
  components: {
    DzTable
  },
  data() {
    var self = this;
    return {
      loading: false,
      dates: [dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")],
      stores: {
        billbuild: {
          query: {
            totalCount: 0,
            pageSize: 20,
            currentPage: 1,
            kw: "",
            fhospitalid: -1,
            fareaid: -1,
            fbedid: -1,
            fmanagerid: -1,
            iscancelmanagecost: -1,
            isclose: -1,
            fisbuild: 0,
            sort: [
              {
                direct: "DESC",
                field: "fdate"
              }
            ],
            dates: []
          },
          columns: [
            {
              type: "selection",
              width: 60,
              align: "center"
            },
            {
              title: "订单号",
              align: "center",
              key: "FOrderBillNo",
              width: 120
            },
            {
              title: "日期",
              align: "center",
              key: "FDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { FDate }
                } = params;
                var text = dayjs(FDate).format("YYYY-MM-DD HH:mm:ss");

                if (FDate != "" && FDate != null) {
                  return h("span", {}, text);
                }
              }
            },
            {
              title: "开始陪护",
              align: "center",
              key: "FBegin",
              width: 150
            },
            {
              title: "结束陪护",
              align: "center",
              key: "FEnd",
              width: 150
            },
            {
              title: "所属医院",
              align: "center",
              key: "FHospitalName",
              width: 120
            },
            {
              title: "病区",
              align: "center",
              key: "FAreaName",
              width: 80
            },
            {
              title: "床号",
              align: "center",
              key: "FBedName",
              width: 80
            },
            {
              title: "管理老师",
              align: "center",
              key: "FManagerName",
              width: 80
            },
            {
              title: "护工",
              align: "center",
              key: "FPcName",
              width: 80
            },
            {
              title: "病人姓名",
              align: "center",
              key: "FClient",
              width: 80
            },
            {
              title: "联系方式",
              align: "center",
              key: "FClientTel",
              width: 100
            },
            {
              title: "收款类型",
              align: "center",
              key: "FRecType",
              width: 120
            },
            {
              title: "收款方式",
              align: "center",
              key: "FPayWayName",
              width: 80
            },
            {
              title: "收款金额",
              align: "center",
              key: "FRecSum",
              width: 80
            },
            {
              title: "生成凭证",
              align: "center",
              key: "FIsBuildPZ",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FIsBuildPZ }
                } = params;

                let statusColor = "success";
                let statusText = "√";
                switch (FIsBuildPZ) {
                  case false:
                    statusText = "-";
                    statusColor = "default";
                    break;
                }
                return h(
                  "Tooltip",
                  {
                    props: {
                      placement: "top",
                      transfer: true,
                      delay: 500
                    }
                  },
                  [
                    //这个中括号表示是Tooltip标签的子标签
                    h(
                      "Tag",
                      {
                        props: {
                          //type: "dot",
                          color: statusColor
                        }
                      },
                      statusText
                    ), //表格列显示文字
                    h(
                      "p",
                      {
                        slot: "content",
                        style: {
                          whiteSpace: "normal"
                        }
                      },
                      statusText //整个的信息即气泡内文字
                    )
                  ]
                );
              }
            },
            {
              title: "生成日期",
              align: "center",
              key: "FPZBuildDate",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FPZBuildDate }
                } = params;
                var text = `${dayjs(FPZBuildDate).format("YYYY-MM-DD")}`;

                if (FPZBuildDate != "" && FPZBuildDate != null) {
                  return h("span", {}, text);
                }
              }
            },
            {
              title: "凭证编号",
              align: "center",
              key: "FPZNo",
              width: 80
            }
          ],
          sources: {
            yesorno: [
              { value: -1, text: "全部" },
              { value: 0, text: "未生成" },
              { value: 1, text: "已生成" }
            ],
            hospiatls: [],
            areas: [],
            beds: [],
            managers: [],
            careProjects: [],
            careWays: [],
            persons: [],
            payWays: []
          },
          data: []
        }
      },
      recSum: 0,
      selectRows: 0,
      selectRowsData: [],
      formValidate: { pzdate: "" },
      modalloading: true
    };
  },
  methods: {
    loadRecordList() {
      // if (
      //   this.stores.billbuild.query.dates[0] == "" &&
      //   this.stores.billbuild.query.dates[1] == ""
      // ) {
      //   return this.$Message.error("请输入检索条件!");
      // }
      getBillBuild(
        Object.assign(
          {},
          this.stores.billbuild.query,
          this.stores.billbuild.query.dates.length <= 0
            ? {}
            : {
                fBeginDate:
                  this.stores.billbuild.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.billbuild.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                fEndDate:
                  this.stores.billbuild.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.billbuild.query.dates[1]).format(
                        "YYYY-MM-DD"
                      )
              }
        )
      ).then(res => {
        this.stores.billbuild.data = res.data.data.map(m => {
          m._disabled = m.FIsBuildPZ;
          return m;
        });
      });
    },

    handleRefresh() {
      this.loadRecordList();
    },
    handleSearchRecordList() {
      this.stores.billbuild.query.currentPage = 1;
      this.loadRecordList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.billbuild.query.currentPage = page;
      this.loadRecordList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.billbuild.query.pageSize = pageSize;
      this.loadRecordList();
    },
    markConfirm() {
      let self = this;
      this.$Modal.confirm({
        title: "操作提示(请按需填写)",
        render: h =>
          h(
            "Form",
            {
              ref: "formValidate",
              props: {
                model: self.formValidate,
                rules: {
                  pzdate: [
                    {
                      required: true,
                      message: "请选择生成生成凭证的日期",
                      trigger: "blur"
                    }
                  ]
                }
              }
            },
            [
              h("FormItem", { prop: "pzdate", props: {} }, [
                h("DatePicker", {
                  props: {
                    transfer: true,
                    type: "date",
                    placeholder: "请选择生成生成凭证的日期",
                    value: self.formValidate.pzdate
                  },
                  style: { width: "50%" },
                  on: {
                    input: val => {
                      self.formValidate.pzdate = val;
                    }
                  }
                })
              ])
            ]
          ),
        loading: true,
        onOk: function() {
          let ids = self.selectRowsData.map(m => {
            return m.FEntryID;
          });

          if (self.formValidate.pzdate != "") {
            updateBillBuild({
              isbuild: 1,
              ids: ids.join(","),
              pzdate: dayjs(self.formValidate.pzdate).format("YYYY-MM-DD")
            })
              .then(res => {
                if (res.data.code === 200) {
                  self.$Message.success(res.data.message);
                  self.selectRowsData = [];
                  self.recSum = 0;
                  self.selectRows = 0;
                  self.handleSearchRecordList();
                } else {
                  self.$Message.warning(res.data.message);
                }
                self.$Modal.remove();
              })
              .catch(err => {});
          } else {
            setTimeout(() => {
              this.buttonLoading = false;
            });
            this.$Message.error("凭证日期尚未填写!");
          }
        }
      });
    },
    integratedData(data) {
      let that = this;
      let arrId = [];
      data.forEach(i => {
        !arrId.includes(i.FOrderBillNo) ? arrId.push(i.FOrderBillNo) : arrId;
      });
      let arrObj = [];
      arrId.forEach(j => {
        arrObj.push({
          id: j,
          num: 0
        });
      });
      data.forEach(k => {
        arrObj.forEach(l => {
          k.FOrderBillNo === l.id ? l.num++ : l.num;
        });
      });
      data.forEach(m => {
        arrObj.forEach((n, index) => {
          if (m.FOrderBillNo === n.id) {
            if (arrId.includes(m.FOrderBillNo)) {
              m.mergeCol = n.num;
              arrId.splice(arrId.indexOf(m.FOrderBillNo), 1);
            } else {
              m.mergeCol = 0;
            }
          }
        });
      });
      return data;
    },
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return {
          rowspan: row.mergeCol === 0 ? 0 : row.mergeCol,
          colspan: row.mergeCol === 0 ? 0 : 1
        };
      }
    },
    summaryRecord(selection) {
      var total = 0;
      selection.map(m => {
        const { FRecSum } = m;
        total = math.add(total, FRecSum);
      });
      this.recSum = total;
      this.selectRows = selection.length;
      this.selectRowsData = JSON.parse(JSON.stringify(selection));
    }
  },
  mounted() {
    getHospitalSelect().then(res => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billbuild.sources.hospiatls = data;
      }
    });

    // getAreaSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billbuild.sources.areas = data;
    //   }
    // });

    // getBedSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billbuild.sources.beds = data;
    //   }
    // });

    // getManagerSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billbuild.sources.managers = data;
    //   }
    // });

    // getCareProjectSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billbuild.sources.careProjects = data;
    //   }
    // });

    // getCareWaySelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billbuild.sources.careWays = data;
    //   }
    // });

    // getPayWaySelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billbuild.sources.payWays = data;
    //   }
    // });

    // getPcSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billbuild.sources.persons = data;
    //   }
    // });
  }
};
</script>

<style>
</style>
