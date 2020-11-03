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
                      v-model="stores.billcheck.query.dates"
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
                      v-model="stores.billcheck.query.fhospitalid"
                      @on-change="handleSearchRecordList"
                      style="width:150px;"
                    >
                      <Option
                        v-for="item in stores.billcheck.sources.hospiatls"
                        :value="item.id"
                        :key="item.id"
                      >{{item.name}}</Option>
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billcheck.query.fisconfirm"
                      @on-change="handleSearchRecordList"
                      style="width:80px;"
                    >
                      <Option
                        v-for="item in stores.billcheck.sources.yesorno"
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
                      v-show="!stores.billcheck.query.fisconfirm"
                    >确认记录</Button>
                  </ButtonGroup>
                </Form>
              </Col>
              <Col :span="2">
                <Button
                  size="large"
                  icon="ios-paper-outline"
                  :loading="loading"
                  @click="exportExcel"
                >导出Execl</Button>
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
          :data="stores.billcheck.data"
          :columns="stores.billcheck.columns"
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
import {
  getBillCheck,
  updateBillCheck,
  ExportExcel,
} from "@/api/sys/billcheck";
import { getHospitalSelect } from "@/api/base/hospital";
import { getAreaSelectAll } from "@/api/base/area";
import { getBedSelectAll } from "@/api/base/bed";
import { getManagerSelectAll } from "@/api/base/manager";
import { getCareProjectSelectAll } from "@/api/base/careproject";
import { getCareWaySelectAll } from "@/api/base/careway";
import { getPayWaySelectAll } from "@/api/base/payway";
import { getPcSelectAll } from "@/api/base/pc";
import { b64toFile } from "@/libs/tools";
import { saveAs } from "file-saver";
import * as math from "mathjs";
export default {
  name: "bill_check_page",
  components: {
    DzTable,
  },
  data() {
    var self = this;
    return {
      loading: false,
      dates: [dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")],
      stores: {
        billcheck: {
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
            fisconfirm: 0,
            sort: [
              {
                direct: "DESC",
                field: "fdate",
              },
            ],
            dates: [],
          },
          columns: [
            {
              type: "selection",
              width: 60,
              align: "center",
            },
            {
              title: "订单号",
              align: "center",
              key: "FOrderBillNo",
              width: 120,
            },
            {
              title: "日期",
              align: "center",
              key: "FDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { FDate },
                } = params;
                var text = dayjs(FDate).format("YYYY-MM-DD HH:mm:ss");

                if (FDate != "" && FDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "开始陪护",
              align: "center",
              key: "FBegin",
              width: 150,
            },
            {
              title: "结束陪护",
              align: "center",
              key: "FEnd",
              width: 150,
            },
            {
              title: "所属医院",
              align: "center",
              key: "FHospitalName",
              width: 120,
            },
            {
              title: "病区",
              align: "center",
              key: "FAreaName",
              width: 80,
            },
            {
              title: "床号",
              align: "center",
              key: "FBedName",
              width: 80,
            },
            {
              title: "管理老师",
              align: "center",
              key: "FManagerName",
              width: 80,
            },
            {
              title: "护工",
              align: "center",
              key: "FPcName",
              width: 80,
            },
            {
              title: "病人姓名",
              align: "center",
              key: "FClient",
              width: 80,
            },
            {
              title: "联系方式",
              align: "center",
              key: "FClientTel",
              width: 100,
            },
            {
              title: "收款类型",
              align: "center",
              key: "FRecType",
              width: 120,
            },
            {
              title: "收款方式",
              align: "center",
              key: "FPayWayName",
              width: 80,
            },
            {
              title: "收款金额",
              align: "center",
              key: "FRecSum",
              width: 80,
            },
            {
              title: "是否对账",
              align: "center",
              key: "FIsConfirm",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FIsConfirm },
                } = params;

                let statusColor = "success";
                let statusText = "√";
                switch (FIsConfirm) {
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
                      delay: 500,
                    },
                  },
                  [
                    //这个中括号表示是Tooltip标签的子标签
                    h(
                      "Tag",
                      {
                        props: {
                          //type: "dot",
                          color: statusColor,
                        },
                      },
                      statusText
                    ), //表格列显示文字
                    h(
                      "p",
                      {
                        slot: "content",
                        style: {
                          whiteSpace: "normal",
                        },
                      },
                      statusText //整个的信息即气泡内文字
                    ),
                  ]
                );
              },
            },
            {
              title: "对账日期",
              align: "center",
              key: "FConfirmDate",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FConfirmDate },
                } = params;
                var text = `${dayjs(FConfirmDate).format("YYYY-MM-DD")}`;

                if (FConfirmDate != "" && FConfirmDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "对账人",
              align: "center",
              key: "FConfirmerName",
              width: 80,
            },
          ],
          sources: {
            yesorno: [
              { value: -1, text: "全部" },
              { value: 0, text: "未对账" },
              { value: 1, text: "已对账" },
            ],
            hospiatls: [],
            areas: [],
            beds: [],
            managers: [],
            careProjects: [],
            careWays: [],
            persons: [],
            payWays: [],
          },
          data: [],
        },
      },
      recSum: 0,
      selectRows: 0,
      selectRowsData: [],
    };
  },
  methods: {
    loadRecordList() {
      // if (
      //   this.stores.billcheck.query.dates[0] == "" &&
      //   this.stores.billcheck.query.dates[1] == ""
      // ) {
      //   return this.$Message.error("请输入检索条件!");
      // }
      getBillCheck(
        Object.assign(
          {},
          this.stores.billcheck.query,
          this.stores.billcheck.query.dates.length <= 0
            ? {}
            : {
                fBeginDate:
                  this.stores.billcheck.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.billcheck.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                fEndDate:
                  this.stores.billcheck.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.billcheck.query.dates[1]).format(
                        "YYYY-MM-DD"
                      ),
              }
        )
      ).then((res) => {
        this.stores.billcheck.data = res.data.data.map((m) => {
          m._disabled = m.FIsConfirm;
          return m;
        });
      });
    },

    handleRefresh() {
      this.loadRecordList();
    },
    handleSearchRecordList() {
      this.stores.billcheck.query.currentPage = 1;
      this.loadRecordList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.billcheck.query.currentPage = page;
      this.loadRecordList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.billcheck.query.pageSize = pageSize;
      this.loadRecordList();
    },
    markConfirm() {
      this.$Modal.confirm({
        title: "操作提示",
        content: `<p>请确认要核对<strong style='color:red'>${this.selectRows}</strong>笔记录吗?\n\r记录总金额为:<strong style='color:red'>￥${this.recSum}</strong></p>`,
        loading: true,
        onOk: () => {
          let ids = this.selectRowsData.map((m) => {
            return m.FEntryID;
          });

          updateBillCheck({
            isConfirm: 1,
            confirmerId: this.$store.state.user.userGuid,
            ids: ids.join(","),
          })
            .then((res) => {
              if (res.data.code === 200) {
                this.$Message.success(res.data.message);
                this.selectRowsData = [];
                this.recSum = 0;
                this.selectRows = 0;
                this.handleSearchRecordList();
              } else {
                this.$Message.warning(res.data.message);
              }
              this.$Modal.remove();
            })
            .catch((err) => {});
        },
      });
    },
    integratedData(data) {
      let that = this;
      let arrId = [];
      data.forEach((i) => {
        !arrId.includes(i.FOrderBillNo) ? arrId.push(i.FOrderBillNo) : arrId;
      });
      let arrObj = [];
      arrId.forEach((j) => {
        arrObj.push({
          id: j,
          num: 0,
        });
      });
      data.forEach((k) => {
        arrObj.forEach((l) => {
          k.FOrderBillNo === l.id ? l.num++ : l.num;
        });
      });
      data.forEach((m) => {
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
          colspan: row.mergeCol === 0 ? 0 : 1,
        };
      }
    },
    summaryRecord(selection) {
      var total = 0;
      selection.map((m) => {
        const { FRecSum } = m;
        total = math.add(total, FRecSum);
      });
      this.recSum = total;
      this.selectRows = selection.length;
      this.selectRowsData = JSON.parse(JSON.stringify(selection));
    },
    exportExcel() {
      const self = this;
      if (this.stores.billcheck.data.length <= 0) {
        return this.$Message.error("没有发现可以导出的数据!");
      }
      return ExportExcel(
        Object.assign(
          {},
          this.stores.billcheck.query,
          this.stores.billcheck.query.dates.length <= 0
            ? {}
            : {
                FBeginDate:
                  this.stores.billcheck.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.billcheck.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                FEndDate:
                  this.stores.billcheck.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.billcheck.query.dates[1]).format(
                        "YYYY-MM-DD"
                      ),
              }
        )
      ).then((response) => {
        const { data, state, mesage } = response.data;
        if (state == "success") {
          const { filename, file } = data;
          let fileexcle = b64toFile(
            file,
            filename,
            "application/vnd.ms-excel;charset=utf-8"
          );
          saveAs(fileexcle, filename);
        } else {
          this.$Notice.error({
            title: "警告",
            desc: "没有查询到要导出的数据!",
          });
        }
      });
    },
  },
  mounted() {
    getHospitalSelect().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billcheck.sources.hospiatls = data;
      }
    });

    // getAreaSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcheck.sources.areas = data;
    //   }
    // });

    // getBedSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcheck.sources.beds = data;
    //   }
    // });

    // getManagerSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcheck.sources.managers = data;
    //   }
    // });

    // getCareProjectSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcheck.sources.careProjects = data;
    //   }
    // });

    // getCareWaySelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcheck.sources.careWays = data;
    //   }
    // });

    // getPayWaySelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcheck.sources.payWays = data;
    //   }
    // });

    // getPcSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcheck.sources.persons = data;
    //   }
    // });
  },
};
</script>

<style>
</style>
