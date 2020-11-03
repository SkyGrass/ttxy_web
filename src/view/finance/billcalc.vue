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
                      v-model="stores.billcalc.query.dates"
                      type="datetimerange"
                      style="width: 200px"
                      format="yyyy-MM-dd"
                      placeholder="请选择日期"
                      clearable
                      @on-ok="handleSearchRecordList()"
                    ></DatePicker>
                  </FormItem>
                  <FormItem>
                    <DatePicker
                      search
                      :value="dates"
                      v-model="stores.billcalc.query.pdates"
                      type="datetimerange"
                      style="width: 230px"
                      format="yyyy-MM-dd"
                      placeholder="请选择开始护理、结束护理日期"
                      clearable
                      @on-ok="handleSearchRecordList()"
                    ></DatePicker>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billcalc.query.fhospitalid"
                      @on-change="handleSearchRecordList"
                      style="width: 150px"
                    >
                      <Option
                        v-for="item in stores.billcalc.sources.hospiatls"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billcalc.query.fisfinish"
                      @on-change="handleSearchRecordList"
                      style="width: 80px"
                    >
                      <Option
                        v-for="item in stores.billcalc.sources.yesorno"
                        :value="item.value"
                        :key="item.value"
                        >{{ item.text }}</Option
                      >
                    </Select>
                  </FormItem>
                  <ButtonGroup>
                    <Button
                      size="large"
                      icon="ios-search"
                      :loading="loading"
                      @click="handleSearchRecordList"
                      >查询</Button
                    >
                    <Button
                      size="large"
                      icon="ios-paper-outline"
                      :loading="loading"
                      :disabled="selectRowsData.length <= 0"
                      @click="markConfirm"
                      v-show="!stores.billcalc.query.fisfinish"
                      >计算</Button
                    >
                  </ButtonGroup>
                </Form>
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
          :data="stores.billcalc.data"
          :columns="stores.billcalc.columns"
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
import { getBillCalc, updateBillCalc } from "@/api/sys/billcalc";
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
  name: "bill_calc_page",
  components: {
    DzTable,
  },
  data() {
    var self = this;
    return {
      loading: false,
      dates: [dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")],
      pdates: [dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")],
      stores: {
        billcalc: {
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
            fisfinish: 0,
            sort: [
              {
                direct: "DESC",
                field: "fdate",
              },
            ],
            dates: [],
            pdates: [],
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
              title: "护理种类",
              align: "center",
              key: "FCareWayName",
              width: 120,
            },
            {
              title: "护理方式",
              align: "center",
              key: "FCareProjectName",
              width: 80,
            },
            {
              title: "护理单价",
              align: "center",
              key: "FPrice",
              width: 80,
            },
            {
              title: "是否计算",
              align: "center",
              key: "FIsFinishAccount",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FIsFinishAccount },
                } = params;

                let statusColor = "success";
                let statusText = "√";
                switch (FIsFinishAccount) {
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
          ],
          sources: {
            yesorno: [
              { value: -1, text: "全部" },
              { value: 0, text: "未计算" },
              { value: 1, text: "已计算" },
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
      selectRowsData: [],
      multiple: [
        { value: 1, text: "1倍" },
        { value: 1.5, text: "1.5倍" },
        { value: 2, text: "2倍" },
        { value: 2.5, text: "2.5倍" },
        { value: 3, text: "3倍" },
      ],
      holidayConfig: {
        dates: [],
        multiple: 1,
      },
    };
  },
  methods: {
    loadRecordList() {
      // if (
      //   this.stores.billcalc.query.dates[0] == "" &&
      //   this.stores.billcalc.query.dates[1] == ""
      // ) {
      //   return this.$Message.error("请输入检索条件!");
      // }
      getBillCalc(
        Object.assign(
          {},
          this.stores.billcalc.query,
          this.stores.billcalc.query.dates.length <= 0
            ? {}
            : {
                fBeginDate:
                  this.stores.billcalc.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.billcalc.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                fEndDate:
                  this.stores.billcalc.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.billcalc.query.dates[1]).format(
                        "YYYY-MM-DD"
                      ),
              },
          this.stores.billcalc.query.pdates.length <= 0
            ? {}
            : {
                fPBeginDate:
                  this.stores.billcalc.query.pdates[0] == ""
                    ? ""
                    : dayjs(this.stores.billcalc.query.pdates[0]).format(
                        "YYYY-MM-DD"
                      ),
                fPEndDate:
                  this.stores.billcalc.query.pdates[1] == ""
                    ? ""
                    : dayjs(this.stores.billcalc.query.pdates[1]).format(
                        "YYYY-MM-DD"
                      ),
              }
        )
      ).then((res) => {
        this.stores.billcalc.data = res.data.data.map((m) => {
          m._disabled = m.FIsFinishAccount;
          return m;
        });
      });
    },

    handleRefresh() {
      this.loadRecordList();
    },
    handleSearchRecordList() {
      this.stores.billcalc.query.currentPage = 1;
      this.loadRecordList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.billcalc.query.currentPage = page;
      this.loadRecordList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.billcalc.query.pageSize = pageSize;
      this.loadRecordList();
    },
    markConfirm() {
      this.$Modal.confirm({
        title: "操作提示(请按需填写)",
        render: (h) =>
          h(
            "Form",
            {
              props: {},
            },
            [
              h(
                "FormItem",
                {
                  props: {},
                },
                [
                  h("DatePicker", {
                    props: {
                      transfer: true,
                      type: "daterange",
                      placeholder: "请选择节假日期区间",
                      value: this.holidayConfig.dates,
                    },
                    style: { width: "50%" },
                    on: {
                      input: (val) => {
                        this.holidayConfig.dates = val;
                      },
                    },
                  }),
                ]
              ),
              h(
                "FormItem",
                {
                  props: {},
                },
                [
                  h(
                    "Select",
                    {
                      props: {
                        transfer: true,
                        clearable: true,
                        placeholder: "请选择节假日工资倍数",
                        value: this.holidayConfig.multiple,
                      },
                      style: { width: "50%" },
                      on: {
                        input: (val) => {
                          this.holidayConfig.multiple = val;
                        },
                      },
                    },
                    this.multiple.map((item) => {
                      return h("Option", {
                        props: {
                          value: item.value,
                          label: item.text,
                        },
                      });
                    })
                  ),
                ]
              ),
            ]
          ),
        loading: true,
        onOk: () => {
          let ids = this.selectRowsData.map((m) => {
            return m.FID;
          });

          updateBillCalc({
            isFinish: 1,
            beginDate:
              this.holidayConfig.dates[0] == ""
                ? ""
                : dayjs(this.holidayConfig.dates[0]).format("YYYY-MM-DD"),
            endDate:
              this.holidayConfig.dates[1] == ""
                ? ""
                : dayjs(this.holidayConfig.dates[1]).format("YYYY-MM-DD"),
            multiple: this.holidayConfig.multiple,
            ids: ids.join(","),
          })
            .then((res) => {
              if (res.data.code === 200) {
                this.$Message.success(res.data.message);
                this.selectRowsData = [];
                this.holidayConfig = {
                  dates: [],
                  multiple: 1,
                };
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
      this.selectRowsData = JSON.parse(JSON.stringify(selection));
    },
  },
  mounted() {
    getHospitalSelect().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billcalc.sources.hospiatls = data;
      }
    });

    // getAreaSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcalc.sources.areas = data;
    //   }
    // });

    // getBedSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcalc.sources.beds = data;
    //   }
    // });

    // getManagerSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcalc.sources.managers = data;
    //   }
    // });

    // getCareProjectSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcalc.sources.careProjects = data;
    //   }
    // });

    // getCareWaySelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcalc.sources.careWays = data;
    //   }
    // });

    // getPayWaySelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcalc.sources.payWays = data;
    //   }
    // });

    // getPcSelectAll().then(res => {
    //   const { state, data } = res.data;
    //   if (state == "success") {
    //     this.stores.billcalc.sources.persons = data;
    //   }
    // });
  },
};
</script>

<style>
</style>
