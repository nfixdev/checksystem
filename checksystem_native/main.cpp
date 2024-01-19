#include <iostream>
#include "json/json.hpp"
#include <fstream>
#include <vector>
#include <unordered_map>
#include <format>
using namespace std;
using json = nlohmann::json;

static void trim(string& str) {
	if (str.empty()) return;
	size_t i = 0;
	while (isspace(str[i]) && i < str.size())
		i++;
	str = str.substr(i);
	i = 1;
	while (isspace(str[str.size() - i]) && str.size()-1!=string::npos)
		i++;
	str = str.substr(0, i);
}

#define ARGV_FILENAME 1
#define ARGV_TESTS 2

auto main(int argc, char** argv) -> int{
	if (argc < 3) {
		cout << "checker [filename] [tests_file.json]" << endl;
		return 1;
	}
	ifstream tests(argv[ARGV_TESTS]);
	json _test = json::parse(tests);
	tests.close();
	unordered_map<std::string, std::string>lang_dict = {
		{"py", "python"},
		{"cpp", "g++"},
		{"js", "node"}
	};

	string fext = argv[ARGV_FILENAME];
	fext = fext.substr(fext.rfind('.') + 1);
	int total = 0;
	int _ok = 0;
	for (auto& [key, value] : _test.items()) {
		vector<string>v_in = value["input"];
		vector<string>v_out = value["output"];
		ofstream in("input.txt");
		string t_w;
		for (auto& s : v_in) {
			t_w += (s + " ");
		}
		while (isspace(t_w.back())) t_w.pop_back();
		in << t_w;
		in.close();
		system(format(
			"{} {}<input.txt 1>output.txt 2>programm_errors.txt",
			lang_dict[fext],
			argv[ARGV_FILENAME]
		).c_str());
		ifstream _err("programm_errors.txt");
		size_t size = 0;
		_err.seekg(0, ios::end);
		size = _err.tellg();
		if (size != 0) {
			cout << "In programm error(see pragramm_errors.txt)\n";
			_err.close();
			break;
		}
		_err.close();
		ifstream out("output.txt");
		char buf[4096];
		int l = 0;
		bool passed = true;
		while (out.getline(buf, 4096, '\n')) {
			string ans = buf;
			while (isspace(ans.back())) ans.pop_back();
			if (ans != v_out[l]) {
				passed = false;
				break;
			}
		}
		if (passed) {
			cout << key << ".....OK\n";
			_ok++;
		}
		else {
			cout << key << "...FAIL\n";
		}
		total++;
		out.close();
	}
	cout << format("Result of check: {}/{}", _ok, total) << endl;
	ofstream res("result.json");
	res << "{" + format(R"("passed": "{}", "total": "{}")", _ok, total)+"}";
	res.close();
	return 0;
}