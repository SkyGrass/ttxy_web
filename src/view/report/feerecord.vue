<template>
  <div>
    <Card>
      <dz-table
        :totalCount="stores.billrecord.query.totalCount"
        :pageSize="stores.billrecord.query.pageSize"
        @on-page-change="handlePageChanged"
        @on-page-size-change="handlePageSizeChanged"
      >
        <div slot="searcher">
          <section class="dnc-toolbar-wrap">
            <Row :gutter="16">
              <Col span="16">
                <Form inline @submit.native.prevent>
                  <FormItem>
                    <Input
                      type="text"
                      clearable
                      v-model="stores.billrecord.query.kw"
                      placeholder="输入订单号、病人姓名名、联系方式进行搜索..."
                      @on-search="handleSearchRecordList()"
                    >
                      <span slot="prepend">检索</span>
                    </Input>
                  </FormItem>
                  <FormItem>
                    <DatePicker
                      search
                      :value="dates"
                      v-model="stores.billrecord.query.dates"
                      type="datetimerange"
                      style="width: 200px"
                      format="yyyy-MM-dd"
                      placeholder="请选择日期"
                      clearable
                      @on-ok="handleSearchRecordList()"
                    ></DatePicker>
                  </FormItem>
                  <!-- <FormItem>
                    <Select
                      v-model="stores.billrecord.query.iscancelmanagecost"
                      @on-change="handleSearchRecordList"
                      style="width:80px;"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.yesorno"
                        :value="item.value"
                        :key="item.value"
                      >{{item.text}}</Option>
                    </Select>
                  </FormItem>-->
                  <!-- <FormItem>
                    <Select
                      v-model="stores.billrecord.query.isclose"
                      @on-change="handleSearchRecordList"
                      style="width:80px;"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.yesorno"
                        :value="item.value"
                        :key="item.value"
                      >{{item.text}}</Option>
                    </Select>
                  </FormItem>-->
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billrecord.query.fhospitalid"
                      @on-change="handleSearchRecordList"
                      style="width: 150px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.hospiatls"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billrecord.query.fareaid"
                      @on-change="handleAreaChanged"
                      style="width: 80px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.areas"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billrecord.query.fbedid"
                      @on-change="handleSearchRecordList"
                      style="width: 80px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.beds"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
                      >
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billrecord.query.fmanagerid"
                      @on-change="handleSearchRecordList"
                      style="width: 80px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.managers"
                        :value="item.id"
                        :key="item.id"
                        >{{ item.name }}</Option
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
                      @click="exportExcel"
                      >导出Execl</Button
                    >
                  </ButtonGroup>
                </Form>
              </Col>
            </Row>
          </section>
          <section style="margin-bottom: 10px">
            <ButtonGroup>
              <Button
                icon="ios-paper-outline"
                :type="showDetail ? 'primary' : undefined"
                @click="doSwitch(0)"
                >明细网格</Button
              >
              <Button
                icon="ios-paper-outline"
                :type="!showDetail ? 'primary' : undefined"
                @click="doSwitch(1)"
                >汇总网格</Button
              >
            </ButtonGroup>
          </section>
        </div>

        <Table
          slot="table"
          ref="tables"
          :border="false"
          size="small"
          v-show="showDetail"
          :highlight-row="true"
          :data="stores.billrecord.data"
          :columns="stores.billrecord.columns"
          @on-refresh="handleRefresh"
          :row-class-name="rowClsRender"
          @on-page-change="handlePageChanged"
          @on-page-size-change="handlePageSizeChanged"
        ></Table>

        <Table
          slot="table"
          ref="tables"
          :border="false"
          size="small"
          v-show="!showDetail"
          :highlight-row="true"
          :data="stores.summary.data"
          :columns="stores.summary.columns"
        ></Table>
      </dz-table>
    </Card>
  </div>
</template>

<script>
import DzTable from "_c/tables/dz-table.vue";
import dayjs from "dayjs";
import {
  getFeeRecord,
  getFeeSummaryRecord,
  ExportExcel,
} from "@/api/sys/feerecord";
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
export default {
  name: "fee_record_page",
  components: {
    DzTable,
  },
  data() {
    var self = this;
    return {
      loading: false,
      showDetail: true,
      dates: [dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")],
      stores: {
        billrecord: {
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
              title: "订单号",
              align: "center",
              key: "FOrderBillNo",
              width: 120,
            },
            {
              title: "日期",
              align: "center",
              key: "FDate",
              width: 130,
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
              width: 120,
            },
            {
              title: "结束陪护",
              align: "center",
              key: "FEnd",
              width: 120,
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
              title: "护理方式",
              align: "center",
              key: "FCareWayName",
              width: 80,
            },
            {
              title: "护理类型",
              align: "center",
              key: "FCareProjectName",
              width: 100,
            },
            {
              title: "护理单价",
              align: "center",
              key: "FPrice",
              width: 80,
            },
            {
              title: "天数",
              align: "center",
              key: "FDay",
              width: 80,
            },
            // {
            //   title: "交叉天数",
            //   align: "center",
            //   key: "FRepeatDay",
            //   width: 80,
            // },
            {
              title: "收款金额",
              align: "center",
              key: "FCost",
              width: 80,
            },
            {
              title: "医院管理费",
              align: "center",
              key: "FHospitalMgrCost",
              width: 80,
            },
            {
              title: "公司管理费",
              align: "center",
              key: "FCompanyMgrCost",
              width: 80,
            },
            {
              title: "护工费",
              align: "center",
              key: "FPersonCost",
              width: 80,
            },
            {
              title: "节日",
              align: "center",
              key: "FPersonCost",
              width: 90,
              render: (h, params) => {
                const {
                  row: { FHolidayBeginDate, FHolidayEndDate },
                } = params;
                var text1 =
                  FHolidayBeginDate != null
                    ? dayjs(FHolidayBeginDate).format("YYYY-MM-DD")
                    : "";
                var text2 =
                  FHolidayEndDate != null
                    ? dayjs(FHolidayEndDate).format("YYYY-MM-DD")
                    : "";

                return h("span", {}, `${text1}-${text2}`);
              },
            },
            {
              title: "节日工资倍数",
              align: "center",
              key: "FMultiple",
              width: 90,
            },
            {
              title: "节日工资合计",
              align: "center",
              key: "FHolidayCost",
              width: 90,
            },
            {
              title: "护工费用合计",
              align: "center",
              key: "FTotalPersonCost",
              width: 90,
            },
            {
              title: "备注",
              align: "center",
              key: "FRemark",
              width: 150,
            },
          ],
          sources: {
            yesorno: [
              { value: -1, text: "全部" },
              { value: 0, text: "否" },
              { value: 1, text: "是" },
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
        summary: {
          columns: [
            {
              title: "订单号",
              align: "center",
              key: "FOrderBillNo",
              width: 120,
            },
            {
              title: "开始陪护",
              align: "center",
              key: "FBeginDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { FBeginDate, FBeginPeriod },
                } = params;
                var text = `${dayjs(FBeginDate).format(
                  "YYYY-MM-DD"
                )}(${FBeginPeriod})`;

                if (FBeginDate != "" && FBeginDate != null) {
                  return h("span", {}, text);
                }
              },
            },
            {
              title: "结束陪护",
              align: "center",
              key: "FEndDate",
              width: 150,
              render: (h, params) => {
                const {
                  row: { FEndDate, FEndPeriod },
                } = params;
                var text = `${dayjs(FEndDate).format(
                  "YYYY-MM-DD"
                )}(${FEndPeriod})`;

                if (FEndDate != "" && FEndDate != null) {
                  return h("span", {}, text);
                }
              },
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
              title: "护理方式",
              align: "center",
              key: "FCareWayName",
              width: 80,
            },
            {
              title: "护理类型",
              align: "center",
              key: "FCareProjectName",
              width: 100,
            },
            {
              title: "护理天数",
              align: "center",
              key: "FDay",
              width: 120,
            },
            {
              title: "收款金额",
              align: "center",
              key: "FCost",
              width: 120,
            },
            {
              title: "医院管理费",
              align: "center",
              key: "FHospitalMgrCost",
              width: 120,
            },
            {
              title: "公司管理费",
              align: "center",
              key: "FCompanyMgrCost",
              width: 120,
            },
            {
              title: "护工费",
              align: "center",
              key: "FPersonCost",
              width: 120,
            },
            {
              title: "节日工资",
              align: "center",
              key: "FHolidayCost",
              width: 120,
            },
            {
              title: "护工总费用",
              align: "center",
              key: "FTotalPersonCost",
              width: 120,
            },
          ],
          data: [],
        },
      },
    };
  },
  methods: {
    doSwitch(type) {
      this.showDetail = type == 0;
      if (this.stores.billrecord.data.length > 0) {
        getFeeSummaryRecord(
          Object.assign(
            {},
            this.stores.billrecord.query,
            this.stores.billrecord.query.dates.length <= 0
              ? {}
              : {
                  fBeginDate:
                    this.stores.billrecord.query.dates[0] == ""
                      ? ""
                      : dayjs(this.stores.billrecord.query.dates[0]).format(
                          "YYYY-MM-DD"
                        ),
                  fEndDate:
                    this.stores.billrecord.query.dates[1] == ""
                      ? ""
                      : dayjs(this.stores.billrecord.query.dates[1]).format(
                          "YYYY-MM-DD"
                        ),
                }
          )
        ).then((res) => {
          console.log(res);
          this.stores.summary.data = res.data.data;
        });
      }
    },
    loadRecordList() {
      // if (
      //   this.stores.billrecord.query.dates[0] == "" &&
      //   this.stores.billrecord.query.dates[1] == ""
      // ) {
      //   return this.$Message.error("请输入检索条件!");
      // }
      getFeeRecord(
        Object.assign(
          {},
          this.stores.billrecord.query,
          this.stores.billrecord.query.dates.length <= 0
            ? {}
            : {
                fBeginDate:
                  this.stores.billrecord.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.billrecord.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                fEndDate:
                  this.stores.billrecord.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.billrecord.query.dates[1]).format(
                        "YYYY-MM-DD"
                      ),
              }
        )
      ).then((res) => {
        this.stores.billrecord.data = res.data.data;
        this.stores.billrecord.query.totalCount = res.data.totalCount;
      });
    },
    handleAreaChanged() {
      this.changeBed();
    },
    handleRefresh() {
      this.loadRecordList();
    },
    handleSearchRecordList() {
      this.stores.billrecord.query.currentPage = 1;
      this.loadRecordList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.billrecord.query.currentPage = page;
      this.loadRecordList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.billrecord.query.pageSize = pageSize;
      this.loadRecordList();
    },
    exportExcel() {
      const self = this;
      if (this.stores.billrecord.data.length <= 0) {
        return this.$Message.error("没有发现可以导出的数据!");
      }
      return ExportExcel(
        Object.assign(
          {},
          this.stores.billrecord.query,
          this.stores.billrecord.query.dates.length <= 0
            ? {}
            : {
                FBeginDate:
                  this.stores.billrecord.query.dates[0] == ""
                    ? ""
                    : dayjs(this.stores.billrecord.query.dates[0]).format(
                        "YYYY-MM-DD"
                      ),
                FEndDate:
                  this.stores.billrecord.query.dates[1] == ""
                    ? ""
                    : dayjs(this.stores.billrecord.query.dates[1]).format(
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
    changeBed() {
      getBedSelectAll({
        HospitalId: this.stores.billrecord.query.fhospitalid,
        AreaId: this.stores.billrecord.query.fareaid,
      }).then((res) => {
        const { state, data } = res.data;
        if (state == "success") {
          this.stores.billrecord.sources.beds = data;
        }
      });
    },
  },
  mounted() {
    getHospitalSelect().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.hospiatls = data;
      }
    });

    getAreaSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.areas = data;
      }
    });

    getBedSelectAll({
      HospitalId: this.stores.billrecord.query.fhospitalid,
      AreaId: this.stores.billrecord.query.fareaid,
    }).then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.beds = data;
      }
    });

    getManagerSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.managers = data;
      }
    });

    getCareProjectSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.careProjects = data;
      }
    });
    getCareWaySelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.careWays = data;
      }
    });
    getPayWaySelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.payWays = data;
      }
    });
    getPcSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.persons = data;
      }
    });
  },
};
</script>

<style>
</style>
