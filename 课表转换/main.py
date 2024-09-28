import os
import bs4
import json

files = os.listdir("data")
files = [i.replace(".wakeup_schedule", "") for i in files]

html = open("data.html", "r", encoding="utf-8").read()

trs = bs4.BeautifulSoup(html, "lxml").find("table").find_all("tr")


iconMap = {
    "机器人": "机器人",
    "计": "计算机",
    "沃尔沃营销": "沃尔沃",
    "物联网": "物联网",
    "数控": "数控",
    "电信": "电信",
    "大众技术": "大众",
    "大众营销": "大众",
    "时尚表演": "时尚表演",
    "龙神": "龙神",
    "航材": "航材",
    "无人机": "无人机",
    "美": "美术",
    "军士汽检": "军士汽检",
    "服": "服装",
    "中车电动": "中车",
    "福特技术": "福特",
    "高职电商": "电商",
    "大众新能源": "大众",
    "大众非技术": "大众",
    "汽制": "汽车制造",
    "汽电": "汽车电子技术",
    "用友新道": "用友",
    "智联": "智联",
    "机制": "机制",
    "宝马非技术": "宝马",
    "保时捷技术": "保时捷",
    "宝马营销": "宝马",
    "北汽技术": "北汽",
    "旅游": "旅游",
    "广本机修": "广本",
    "电商": "电商",
    "福特营销": "福特",
    "计算机": "计算机",
    "机工": "数控",
    "广本营销": "广本",
    "高职应电": "扳手",
    "财管": "财务管理",
    "服装": "服装",
    "航装": "航材",
    "龙神钣喷": "龙神",
    "信息安全": "信息安全",
    "视传": "视传",
    "军士机制": "军士机制",
    "大数据": "大数据",
    "服设": "服设",
    "飞修": "飞修",
    "军士汽制": "军士汽制",
    "人力": "人力",
    "航发": "航发",
    "数影": "数影",
    "军士信安": "军士信安",
    "室内": "室内",
    "北汽": "北汽",
    "军士网络": "军士网络",
    "智交": "智交",
    "新能源": "新能源",
    "移动互联": "移动互联",
    "服装表演": "服装表演",
    "网络": "网络",
    "软件": "软件",
    "商英": "商英",
    "车辆职": "车辆职",
    "电子": "电子",
    "中车焊接": "中车焊接",
    "宝马技术": "宝马技术",
    "轮机": "轮机",
    "陕汽技术": "陕汽技术",
    "中车": "中车",
    "车改": "车改",
    "通用技术": "通用技术",
    "数媒": "数媒",
    "沃尔沃技术": "沃尔沃技术",
    "高职服装": "高职服装",
    "工程": "工程",
    "飞制": "飞制",
    "沃尔沃非技术": "沃尔沃非技术",
    "会计": "会计",
    "电气": "电气",
    "产品": "产品",
    "美术": "美术",
    "汽智": "汽智",
    "跨境电商": "跨境电商",
    "模具": "模具",
    "汽检": "汽检",
    "车工": "车工",
    "风电": "风电",
    "中车工艺": "中车工艺",
    "电会": "电会",
    "智控": "智控",
    "钣喷": "钣喷",
    "理想": "理想",
    "工业机器人": "工业机器人",
    "汽营": "汽营",
    "电": "电",
    "营销": "营销",
    "机电": "机电",
    "广本钣喷": "广本钣喷",
    "国贸": "国贸",
    "福特非技术": "福特非技术",
}


class Course:
    def __init__(self) -> None:
        self.class_name = None  # 班级名称
        self.grade = None  # 所属年级
        self.department = None  # 所属院/系/部
        self.major = None  # 所属专业
        self.campus = None  # 所在校区
        self.counselor = None  # 辅导员

        self.icon = None  # 图标

    def print(self):
        print("课程信息=============================")
        print(f"班级名称：{self.class_name}")
        print(f"所属年级：{self.grade}")
        print(f"所属院/系/部：{self.department}")
        print(f"所属专业：{self.major}")
        print(f"所在校区：{self.campus}")
        print(f"辅导员：{self.counselor}")

    def to_json(self):
        return json.dumps(
            {
                "class_name": self.class_name,
                "grade": self.grade,
                "department": self.department,
                "major": self.major,
                "campus": self.campus,
                "counselor": self.counselor,
                "icon": self.icon,
            },
            allow_nan=True,
            ensure_ascii=False,
            indent=4,
        )

    def to_dict(self):
        return {
            "class_name": self.class_name,
            "grade": self.grade,
            "department": self.department,
            "major": self.major,
            "campus": self.campus,
            "counselor": self.counselor,
            "icon": self.icon,
        }


courses = []
dp = []

for tr in trs:
    tds = tr.find_all("td")
    if len(tds) == 12:
        c = Course()
        for i in tds:
            c.grade = tds[4].text.strip()
            c.class_name = tds[3].text.strip()
            c.department = tds[5].text.strip()
            c.major = tds[6].text.strip()
            c.campus = tds[7].text.strip()
            c.counselor = (
                tds[9].text.strip().split("]")[1]
                if "]" in tds[9].text.strip()
                else tds[9].text.strip()
            )
            for j in iconMap.keys():
                if j in c.class_name or j in c.major:
                    c.icon = j
            if c.icon is None:
                c.icon = "其他"

        if int(c.grade) < 2022:
            continue
        if c.class_name in dp:
            print("存在跳过", c.class_name, dp)
            continue
        if c.class_name not in files:
            continue
        dp.append(c.class_name)
        courses.append(c)

print(len(trs), "总共")
print(len(courses), "个班级")

for i in courses:
    i: Course = i
    with open(f"jsons/{i.class_name}.json", "w", encoding="utf-8") as f:
        f.write(i.to_json())

with open("all.json", "w", encoding="utf-8") as f:
    f.write(
        json.dumps(
            [i.to_dict() for i in courses],
            allow_nan=True,
            ensure_ascii=False,
            indent=4,
        ),
    )
