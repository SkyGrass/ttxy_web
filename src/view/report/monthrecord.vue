<template>
  <div>
    <Card>
      <dz-table
        :showPagination="false"
        :totalCount="stores.billrecord.query.totalCount"
        :pageSize="stores.billrecord.query.pageSize"
        @on-page-change="handlePageChanged"
        @on-page-size-change="handlePageSizeChanged"
      >
        <div slot="searcher">
          <section class="dnc-toolbar-wrap">
            <Row :gutter="24">
              <Col span="10">
                <Form inline @submit.native.prevent>
                  <FormItem>
                    <Input
                      type="text"
                      clearable
                      v-model="stores.billrecord.query.kw"
                      placeholder="输入订单号、护工、客户名、客户电话进行搜索..."
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
                  <FormItem>
                    <Select
                      clearable
                      v-model="stores.billrecord.query.fpaywayid"
                      @on-change="handleSearchRecordList"
                      style="width: 80px"
                    >
                      <Option
                        v-for="item in stores.billrecord.sources.payWays"
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
              <Col span="14">
                <dz-table :showPagination="false">
                  <Table
                    slot="table"
                    ref="tables_summary"
                    :border="false"
                    size="small"
                    :highlight-row="true"
                    :data="stores.billrecord.data_summary"
                    :columns="stores.billrecord.columns_summary"
                    :row-class-name="rowClsRender"
                  ></Table>
                </dz-table>
              </Col>
            </Row>
          </section>
        </div>
        <Table
          slot="table"
          ref="tables"
          :border="false"
          size="small"
          :highlight-row="true"
          :data="stores.billrecord.data"
          :columns="stores.billrecord.columns"
          @on-refresh="handleRefresh"
          :row-class-name="rowClsRender"
          @on-page-change="handlePageChanged"
          @on-page-size-change="handlePageSizeChanged"
        ></Table>
      </dz-table>
    </Card>
  </div>
</template>

<script>
import DzTable from "_c/tables/dz-table.vue";
import dayjs from "dayjs";
import { getMonthCollect, ExportExcel } from "@/api/sys/billmonth";
import { getHospitalSelect } from "@/api/base/hospital";
import { getAreaSelectAll } from "@/api/base/area";
import { getBedSelectAll } from "@/api/base/bed";
import { getManagerSelectAll } from "@/api/base/manager";
import { getPayWaySelectAll } from "@/api/base/payway";
import { getPcSelectAll } from "@/api/base/pc";
import { getUserSelectAll } from "@/api/rbac/user";
import { b64toFile } from "@/libs/tools";
import { saveAs } from "file-saver";
import expandRow from "./table-expand.vue";
export default {
  name: "month_record_page",
  components: {
    DzTable,
    expandRow,
  },
  data() {
    var self = this;
    return {
      loading: false,
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static",
      },
      curRecord: {},
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
            isclosed: -1,
            fpaywayid: -1,
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
              title: "所属医院",
              align: "center",
              key: "FHospitalID",
              width: 120,
              render: (h, params) => {
                const {
                  row: { FHospitalID },
                } = params;
                var tmp = self.stores.billrecord.sources.hospiatls.find(
                  (f) => f.id == FHospitalID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "病区",
              align: "center",
              key: "FAreaID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FAreaID },
                } = params;
                var tmp = self.stores.billrecord.sources.areas.find(
                  (f) => f.id == FAreaID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "客户",
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
              title: "床号",
              align: "center",
              key: "FBedID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FBedID },
                } = params;
                var tmp = self.stores.billrecord.sources.beds_bark.find(
                  (f) => f.id == FBedID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "管理老师",
              align: "center",
              key: "FManagerID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FManagerID },
                } = params;
                var tmp = self.stores.billrecord.sources.managers.find(
                  (f) => f.id == FManagerID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "护工",
              align: "center",
              key: "FPersonID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FPersonID },
                } = params;
                var tmp = self.stores.billrecord.sources.persons.find(
                  (f) => f.id == FPersonID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "收款方式",
              align: "center",
              key: "FRecWayID",
              width: 80,
              render: (h, params) => {
                const {
                  row: { FRecWayID },
                } = params;
                var tmp = self.stores.billrecord.sources.payWays.find(
                  (f) => f.id == FRecWayID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                }
              },
            },
            {
              title: "金额",
              align: "center",
              key: "FRecSum",
              width: 120,
            },
          ],
          sources: {
            yesorno: [
              { value: -1, text: "全部" },
              { value: 0, text: "未出院结算" },
              { value: 1, text: "已出院结算" },
            ],
            hospiatls: [],
            areas: [],
            beds: [],
            beds_bark: [],
            managers: [],
            careProjects: [],
            careWays: [],
            persons: [],
            payWays: [],
            users: [],
          },
          data: [],
          columns_summary: [
            {
              title: "收款方式",
              align: "center",
              key: "FRecWayID",
              width: 120,
              render: (h, params) => {
                const {
                  row: { FRecWayID },
                } = params;
                var tmp = self.stores.billrecord.sources.payWays.find(
                  (f) => f.id == FRecWayID
                );

                if (tmp) {
                  return h("span", {}, tmp.name);
                } else if (FRecWayID == -999) {
                  return h("span", {}, "合计");
                }
              },
            },
            {
              title: "金额",
              align: "center",
              key: "FRecSum",
              width: 120,
            },
          ],
          data_summary: [],
        },
      },
    };
  },
  methods: {
    loadRecordList() {
      getMonthCollect(
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
        this.stores.billrecord.data_summary = res.data.data_summary;
      });
    },
    handleAreaChanged() {
      this.changeBed();
      this.loadRecordList();
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
        this.stores.billrecord.sources.beds_bark = data;
      }
    });

    getManagerSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.managers = data;
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
    getUserSelectAll().then((res) => {
      const { state, data } = res.data;
      if (state == "success") {
        this.stores.billrecord.sources.users = data;
      }
    });
  },
};
</script>

<style>
</style>